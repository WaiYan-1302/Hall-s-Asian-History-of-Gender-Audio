const state = {
  sections: [],
  currentId: null,
  fontSize: Number(localStorage.getItem('chapter8-font-size') || 1.13),
};

document.documentElement.style.setProperty('--reader-size', `${state.fontSize}rem`);
if (localStorage.getItem('chapter8-theme') === 'dark') document.body.classList.add('dark');

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderText(raw) {
  const blocks = raw.split(/\n{2,}/).map(x => x.trim()).filter(Boolean);
  return blocks.map(block => {
    const safe = escapeHtml(block).replaceAll('\n', '<br>');
    if (/^BOX\s+\d+(\.\d+)?/i.test(block) || /^Testimony of/i.test(block) || /^A Pledge/i.test(block)) {
      return `<div class="box-title">${safe}</div>`;
    }
    if (/^[A-Z][A-Za-z ,:'“”\-]+$/.test(block) && block.length < 85) {
      return `<h3>${safe}</h3>`;
    }
    return `<p>${safe}</p>`;
  }).join('\n');
}

function setActiveButton(id) {
  document.querySelectorAll('.section-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sectionId === id);
  });
}

async function loadSection(id) {
  const section = state.sections.find(s => s.id === id) || state.sections[0];
  if (!section) return;
  state.currentId = section.id;
  setActiveButton(section.id);
  $('sectionTitle').textContent = section.title;
  $('sectionDescription').textContent = section.description || '';
  $('readerText').innerHTML = '<div class="loading">Loading reading text…</div>';
  const url = new URL(window.location.href);
  url.searchParams.set('section', section.id);
  history.replaceState(null, '', url);
  try {
    const response = await fetch(section.file);
    if (!response.ok) throw new Error(`Could not load ${section.file}`);
    const raw = await response.text();
    $('readerText').innerHTML = renderText(raw);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    $('readerText').innerHTML = `<div class="error">Could not load this section. On your computer, test with <code>python3 -m http.server 8000</code> instead of opening the file directly.</div>`;
    console.error(err);
  }
}

function renderButtons(sections) {
  $('sectionButtons').innerHTML = sections.map(section => `
    <button class="section-button" type="button" data-section-id="${section.id}">
      <strong>${escapeHtml(section.title)}</strong>
      <span>${escapeHtml(section.description || '')}</span>
    </button>
  `).join('');
  document.querySelectorAll('.section-button').forEach(btn => {
    btn.addEventListener('click', () => loadSection(btn.dataset.sectionId));
  });
}

async function init() {
  try {
    const response = await fetch('sections.json');
    if (!response.ok) throw new Error('sections.json not found');
    const data = await response.json();
    $('siteTitle').textContent = data.title || 'Gender and World War II';
    $('siteSubtitle').textContent = data.subtitle || '';
    state.sections = data.sections || [];
    renderButtons(state.sections);
    const requested = new URLSearchParams(location.search).get('section');
    await loadSection(requested || state.sections[0]?.id);
  } catch (err) {
    $('readerText').innerHTML = '<div class="error">Could not load section data. Make sure all files were uploaded together.</div>';
    console.error(err);
  }
}

$('increaseFont').addEventListener('click', () => {
  state.fontSize = Math.min(1.6, state.fontSize + 0.06);
  localStorage.setItem('chapter8-font-size', state.fontSize.toFixed(2));
  document.documentElement.style.setProperty('--reader-size', `${state.fontSize}rem`);
});

$('decreaseFont').addEventListener('click', () => {
  state.fontSize = Math.max(0.9, state.fontSize - 0.06);
  localStorage.setItem('chapter8-font-size', state.fontSize.toFixed(2));
  document.documentElement.style.setProperty('--reader-size', `${state.fontSize}rem`);
});

$('toggleTheme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('chapter8-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

init();
