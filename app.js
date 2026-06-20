const CHAPTERS_URL = 'chapters.json';

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  const total = Math.max(0, Math.floor(sec));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

async function fetchJSON(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}

async function fetchText(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.text();
}

async function loadChapters() {
  return fetchJSON(CHAPTERS_URL);
}

function sectionHref(chapter, section) {
  return `chapter.html?chapter=${encodeURIComponent(chapter.id)}&section=${encodeURIComponent(section.id)}`;
}

function statusText(chapter) {
  const status = chapter.status || 'ready';
  if (status === 'ready') return 'Ready';
  if (status === 'draft') return 'Draft';
  if (status === 'missing-audio') return 'Missing audio';
  return status;
}

function renderHome(data) {
  const siteTitle = qs('#siteTitle');
  const courseTitle = qs('#courseTitle');
  const list = qs('#chapterList');
  const msg = qs('#homeMessage');

  document.title = data.siteTitle || 'Reading Audiobook Library';
  siteTitle.textContent = data.siteTitle || 'Reading Audiobook Library';
  courseTitle.textContent = data.courseTitle || 'Course Reading Room';

  list.innerHTML = '';
  const chapters = data.chapters || [];

  if (!chapters.length) {
    msg.textContent = 'No chapters yet. Add one to chapters.json.';
    return;
  }

  msg.classList.add('hidden');

  for (const chapter of chapters) {
    const sections = chapter.sections || [];
    const singleSection = sections.length === 1 ? sections[0] : null;
    const card = el(singleSection ? 'a' : 'div', 'chapter-card');
    if (singleSection) card.href = sectionHref(chapter, singleSection);

    const title = el('h2', '', chapter.title || chapter.id);
    const subtitle = el('p', '', chapter.subtitle || '');
    const meta = el('div', 'card-meta');
    meta.appendChild(el('span', 'pill', chapter.dateAdded ? `Added ${chapter.dateAdded}` : 'No date'));
    meta.appendChild(el('span', 'pill', `${sections.length || 0} section${sections.length === 1 ? '' : 's'}`));
    meta.appendChild(el('span', 'pill', statusText(chapter)));

    card.appendChild(title);
    if (chapter.subtitle) card.appendChild(subtitle);
    card.appendChild(meta);

    if (sections.length > 1) {
      const sectionList = el('div', 'section-list');
      for (const section of sections) {
        const link = el('a', 'section-link');
        link.href = sectionHref(chapter, section);
        link.innerHTML = `<span>${escapeHTML(section.title || section.id)}</span><span>Open →</span>`;
        sectionList.appendChild(link);
      }
      card.appendChild(sectionList);
    } else if (singleSection) {
      const sectionList = el('div', 'section-list');
      const link = el('span', 'section-link');
      link.innerHTML = `<span>${escapeHTML(singleSection.title || 'Open reading')}</span><span>Open →</span>`;
      sectionList.appendChild(link);
      card.appendChild(sectionList);
    }

    list.appendChild(card);
  }
}

function getQueryParams() {
  const params = new URLSearchParams(location.search);
  return {
    chapter: params.get('chapter'),
    section: params.get('section')
  };
}

function findChapterAndSection(data, chapterId, sectionId) {
  const chapters = data.chapters || [];
  const chapter = chapters.find(c => c.id === chapterId) || chapters[0];
  if (!chapter) return { chapter: null, section: null };
  const sections = chapter.sections || [];
  const section = sections.find(s => s.id === sectionId) || sections[0];
  return { chapter, section };
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isHeadingStart(text) {
  return text.startsWith('The Tokugawa State and the Regulating') ||
         text.startsWith('Sexuality and the Arts') ||
         text.startsWith('BOX 2.3') ||
         text.startsWith('Gender and Farm Families');
}

function buildSegments(timings, fallbackText) {
  if (Array.isArray(timings) && timings.length) {
    return timings.map((item, idx) => ({
      id: item.id ?? idx + 1,
      start: Number(item.start) || 0,
      end: Number(item.end) || Number(item.start) || 0,
      text: item.text || ''
    }));
  }

  // Fallback only. Prefer real timings.json for click-to-seek and highlighting.
  const sentences = fallbackText
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  return sentences.map((text, idx) => ({
    id: idx + 1,
    start: idx * 8,
    end: (idx + 1) * 8,
    text
  }));
}

function findActiveIndex(segments, time) {
  let lo = 0;
  let hi = segments.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (time < segments[mid].start) hi = mid - 1;
    else if (time > segments[mid].end) lo = mid + 1;
    else return mid;
  }
  return Math.max(0, Math.min(segments.length - 1, hi));
}

function renderSegments(segments, textEl, audio) {
  textEl.innerHTML = '';
  const spans = [];

  for (const [idx, segment] of segments.entries()) {
    const span = document.createElement('span');
    span.className = 'seg';
    if (isHeadingStart(segment.text)) span.classList.add('section-mark');
    span.dataset.index = String(idx);
    span.dataset.start = String(segment.start);
    span.dataset.end = String(segment.end);
    span.title = `${formatTime(segment.start)} – ${formatTime(segment.end)}`;
    span.textContent = segment.text + ' ';
    span.addEventListener('click', () => {
      audio.currentTime = Number(segment.start) + 0.02;
      audio.play();
    });
    textEl.appendChild(span);
    spans.push(span);
  }

  return spans;
}

async function renderChapterPage() {
  const readerMessage = qs('#readerMessage');
  const textEl = qs('#text');
  const audio = qs('#audio');
  const timeLabel = qs('#timeLabel');
  const back10 = qs('#back10');
  const forth10 = qs('#forth10');
  const toggleScroll = qs('#toggleScroll');
  const clearMark = qs('#clearMark');
  const speedSelect = qs('#speedSelect');

  const params = getQueryParams();
  const data = await loadChapters();
  const { chapter, section } = findChapterAndSection(data, params.chapter, params.section);

  if (!chapter || !section) {
    readerMessage.className = 'error';
    readerMessage.textContent = 'No chapter found. Check chapters.json.';
    return;
  }

  document.title = `${chapter.title || 'Chapter'} — Reading Audiobook`;
  qs('#readerTopTitle').textContent = `${chapter.title || 'Chapter'} Reading Audiobook`;
  qs('#chapterKicker').textContent = data.courseTitle || 'Reading';
  qs('#chapterTitle').textContent = chapter.title || chapter.id;
  qs('#sectionTitle').textContent = section.title || section.id;

  const meta = qs('#chapterMeta');
  meta.innerHTML = '';
  if (chapter.subtitle) meta.appendChild(el('span', 'pill', chapter.subtitle));
  if (chapter.dateAdded) meta.appendChild(el('span', 'pill', `Added ${chapter.dateAdded}`));
  meta.appendChild(el('span', 'pill', statusText(chapter)));

  audio.src = section.audio;

  const [text, timings] = await Promise.all([
    fetchText(section.text),
    fetchJSON(section.timings).catch(() => [])
  ]);

  const segments = buildSegments(timings, text);
  const spans = renderSegments(segments, textEl, audio);
  readerMessage.classList.add('hidden');

  let autoScroll = true;
  let activeIndex = -1;

  function setActive(index) {
    if (index === activeIndex) return;
    if (activeIndex >= 0 && spans[activeIndex]) spans[activeIndex].classList.remove('active');
    activeIndex = index;

    spans.forEach((span, i) => {
      span.classList.toggle('played', i < index);
    });

    if (index >= 0 && spans[index]) {
      spans[index].classList.add('active');
      if (autoScroll) {
        spans[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function update() {
    if (!segments.length) return;
    const idx = findActiveIndex(segments, audio.currentTime);
    setActive(idx);
    timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  }

  audio.addEventListener('timeupdate', update);
  audio.addEventListener('loadedmetadata', update);
  audio.addEventListener('seeked', update);

  back10.addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  });

  forth10.addEventListener('click', () => {
    const max = Number.isFinite(audio.duration) ? audio.duration : audio.currentTime + 10;
    audio.currentTime = Math.min(max, audio.currentTime + 10);
  });

  toggleScroll.addEventListener('click', () => {
    autoScroll = !autoScroll;
    toggleScroll.textContent = `Auto-scroll: ${autoScroll ? 'on' : 'off'}`;
  });

  clearMark.addEventListener('click', () => {
    spans.forEach(span => span.classList.remove('active', 'played'));
    activeIndex = -1;
  });

  speedSelect.addEventListener('change', () => {
    audio.playbackRate = Number(speedSelect.value) || 1;
  });
}

async function main() {
  const page = document.body.dataset.page;
  try {
    if (page === 'home') {
      const data = await loadChapters();
      renderHome(data);
    } else if (page === 'chapter') {
      await renderChapterPage();
    }
  } catch (error) {
    console.error(error);
    const msg = qs('#homeMessage') || qs('#readerMessage');
    if (msg) {
      msg.className = 'error';
      msg.innerHTML = `Could not load site data.<br><br>${escapeHTML(error.message)}<br><br>If you opened this with <code>file://</code>, run a local server or upload to GitHub Pages.`;
    }
  }
}

main();
