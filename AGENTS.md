# AGENTS.md

## Project identity

This repository is a **static GitHub Pages audiobook reading library** for weekly course readings. It is not a generic web app. It should feel like a calm, warm, book-style reading room where the user can choose a chapter, play the audiobook, and follow the exact reading text with timed highlights.

The current project has already been refactored from a single Japan page into a reusable chapter-library structure.

Core goals:

- Home screen shows a chapter list.
- Each chapter may have one full section or multiple subchapters/sections.
- Each section can have exact text, an MP3 audiobook, and sentence-level timing/highlight data.
- Weekly new readings can be added without rewriting old chapters.
- Old chapter URLs must keep working.
- The site must remain uploadable directly to GitHub Pages after extraction.

Do **not** redesign this into a dashboard, LMS, or modern SaaS-style app. Preserve the current book aesthetic.

---

## Current architecture

The current upload-ready site should follow this structure:

```text
/
├─ index.html                  # Home screen: chapter list
├─ chapter.html                # Reusable reader page for any chapter/section
├─ styles.css                  # Shared book-style design system
├─ app.js                      # Home + reader logic, timing, highlight, click-to-seek
├─ chapters.json               # Table of contents / chapter metadata
├─ AGENTS.md                   # Instructions for future agents
├─ README.md                   # Human upload/update instructions
├─ _chapter-template/          # Copy this when adding a new weekly chapter
│  ├─ README.md
│  ├─ text.txt
│  └─ timings.json
└─ chapters/
   └─ chapter-02-japan/
      ├─ chapter.json          # Optional chapter-local metadata
      ├─ text.txt              # Exact Japan reading text
      ├─ audio.mp3             # Japan audiobook
      └─ timings.json          # Sentence-level timing for Japan audio
```

The current Japan chapter is the reference implementation:

```text
Chapter id: chapter-02-japan
Section id: full
Title: Japan
Subtitle: Early Modern East Asia Reading
Reader URL: chapter.html?chapter=chapter-02-japan&section=full
```

---

## Design system to preserve

Use the existing `styles.css`, `index.html`, and `chapter.html` as the source of truth. Future changes should refine, not replace, this look.

### Visual atmosphere

The site should feel like:

- A printed book page.
- A quiet reading room.
- Warm, academic, and readable.
- Lightweight and calm, not flashy.

### Color palette

Preserve this palette unless the user explicitly asks for a redesign:

```css
:root {
  --paper: #f6efe2;
  --paper-edge: #e7dac5;
  --ink: #24211d;
  --muted: #74695c;
  --accent: #9b6b43;
  --accent-soft: #f0d6a8;
  --active: #ffe8a3;
  --active-border: #c68b3c;
  --shadow: rgba(52, 37, 18, 0.18);
}
```

### Typography

- Use serif fonts for the reading experience: Georgia, Times New Roman, or similar.
- Body reading text should be large enough for long reading sessions.
- Avoid cramped line height. Use generous line spacing.
- Titles can be elegant and slightly larger, but not decorative to the point of distraction.
- Keep paragraphs and sentence segments easy to scan.

### Layout

Preserve these design patterns:

- Centered page/card layout.
- Warm paper background.
- Book-like content area with generous padding.
- Soft shadow, subtle borders, and rounded corners.
- Sticky audio/control bar on the chapter reader.
- Clear back link from chapter page to home.
- Mobile-friendly single-column layout.

### Highlight behavior design

- Current sentence highlight should use a soft yellow highlight.
- Already-played text can be subtly muted or marked, but should remain readable.
- Active sentence should be obvious without feeling neon or distracting.
- Clickable text should not look like blue web links. It should feel like interactive book text.

### What not to do

Do not:

- Add heavy frameworks unless explicitly requested.
- Replace the design with Bootstrap/Tailwind default styling.
- Use bright app-like colors that break the book style.
- Put all chapter text inside HTML files.
- Require a backend, database, build step, or API.
- Break GitHub Pages compatibility.

---

## Home screen requirements

`index.html` is the library home screen.

It should show:

- Site title from `chapters.json`.
- Course title or subtitle from `chapters.json`.
- A list/grid of chapter cards.
- Each chapter card should show:
  - Chapter title.
  - Subtitle or topic.
  - Date added.
  - Number of sections.
  - Status: `ready`, `draft`, `missing-audio`, or similar.

Behavior:

- If a chapter has one section, the chapter card can open that section directly.
- If a chapter has multiple sections, show nested section links.
- Links should use `chapter.html?chapter=<chapter-id>&section=<section-id>`.
- Home screen must stay simple and warm, like a table of contents in a book.

---

## Chapter reader requirements

`chapter.html` is the reusable reader page.

It must read query parameters like:

```text
chapter.html?chapter=chapter-02-japan&section=full
chapter.html?chapter=chapter-03-korea&section=section-01
```

Expected behavior:

1. Load `chapters.json`.
2. Find the requested chapter and section.
3. Load the section's `text.txt`, `audio.mp3`, and `timings.json`.
4. Render the exact text as clickable timed segments.
5. Play audio through the browser's native audio element.
6. Highlight the active sentence while audio plays.
7. Auto-scroll the active sentence into view when enabled.
8. Let the user click a sentence to seek to that audio time.
9. Provide controls for:
   - Play/pause through audio element.
   - Back 10 seconds.
   - Forward 10 seconds.
   - Auto-scroll toggle.
   - Clear highlight.
   - Optional playback speed.
10. Provide a visible “Back to chapters” link.

Never assume browsers allow autoplay. The user must press play.

---

## `chapters.json` data model

The root-level `chapters.json` is the table of contents. Keep it valid JSON.

Single-section chapter example:

```json
{
  "siteTitle": "Reading Audiobook Library",
  "courseTitle": "Gender and Sexuality in East Asia",
  "chapters": [
    {
      "id": "chapter-02-japan",
      "title": "Japan",
      "subtitle": "Early Modern East Asia Reading",
      "folder": "chapters/chapter-02-japan",
      "dateAdded": "2026-06-20",
      "status": "ready",
      "sections": [
        {
          "id": "full",
          "title": "Full Japan Section",
          "text": "chapters/chapter-02-japan/text.txt",
          "audio": "chapters/chapter-02-japan/audio.mp3",
          "timings": "chapters/chapter-02-japan/timings.json"
        }
      ]
    }
  ]
}
```

Multi-section chapter example:

```json
{
  "id": "chapter-03-example",
  "title": "Chapter 3 Title",
  "subtitle": "Optional subtitle",
  "folder": "chapters/chapter-03-example",
  "dateAdded": "2026-06-27",
  "status": "ready",
  "sections": [
    {
      "id": "section-01",
      "title": "Section 1 Title",
      "text": "chapters/chapter-03-example/section-01/text.txt",
      "audio": "chapters/chapter-03-example/section-01/audio.mp3",
      "timings": "chapters/chapter-03-example/section-01/timings.json"
    },
    {
      "id": "section-02",
      "title": "Section 2 Title",
      "text": "chapters/chapter-03-example/section-02/text.txt",
      "audio": "chapters/chapter-03-example/section-02/audio.mp3",
      "timings": "chapters/chapter-03-example/section-02/timings.json"
    }
  ]
}
```

Rules:

- `id` values should be lowercase, URL-safe, and stable.
- Do not rename old IDs after publishing.
- Use relative paths only.
- Keep `dateAdded` in `YYYY-MM-DD` format.
- Use `status: "ready"` only when text, audio, and timing files all exist.

---

## Chapter folder patterns

For a normal one-section chapter:

```text
chapters/chapter-03-korea/
├─ chapter.json
├─ text.txt
├─ audio.mp3
└─ timings.json
```

For a chapter with subchapters:

```text
chapters/chapter-04-example/
├─ chapter.json
├─ section-01/
│  ├─ text.txt
│  ├─ audio.mp3
│  └─ timings.json
├─ section-02/
│  ├─ text.txt
│  ├─ audio.mp3
│  └─ timings.json
└─ section-03/
   ├─ text.txt
   ├─ audio.mp3
   └─ timings.json
```

Use `_chapter-template/` as the starting point for new chapters.

---

## Timing format

Use sentence-level timing by default.

Recommended `timings.json` format:

```json
[
  {
    "id": 1,
    "start": 0.0,
    "end": 10.7,
    "text": "Exact sentence or text segment here."
  },
  {
    "id": 2,
    "start": 10.7,
    "end": 18.4,
    "text": "Next exact sentence or text segment here."
  }
]
```

Rules:

- `start` and `end` are seconds.
- Segment text should match visible text as closely as possible.
- Timing should follow the actual audio version.
- If the audio was generated from cleaned text, the timing must follow the cleaned audio text.
- If exact forced alignment is not available, approximate sentence timing is acceptable, but say so clearly in the README or final response.
- Sentence-level timing is preferred over paragraph timing for study use.

---

## Weekly append workflow

When adding a new weekly reading:

1. Create a new folder under `chapters/`.
2. Add `text.txt` with the exact reading text.
3. Add `audio.mp3`.
4. Add `timings.json`.
5. Add or update `chapter.json` if useful.
6. Add the chapter entry to root `chapters.json`.
7. Test locally with a static server.
8. Confirm the home card appears.
9. Confirm the chapter link opens.
10. Confirm audio plays.
11. Confirm highlighting follows audio.
12. Confirm clicking text seeks the audio.
13. Keep old chapter URLs working.

Do not overwrite older chapters unless the user explicitly asks.

---

## Text handling rules

- Preserve exact reading text when the user asks for exact text.
- Do not summarize or paraphrase inside `text.txt`.
- Do not silently modernize spelling, punctuation, hyphenation, OCR errors, or page artifacts if “exact text” is required.
- If creating a cleaner reading version, save it separately as `text_clean.txt` and keep original as `text.txt`.
- If audio is generated from a cleaned version, make `timings.json` match the audio version, not a different source.
- Avoid embedding long copyrighted reading text directly in chat responses. Store user-provided text in project files when needed.

---

## Audio handling rules

- Use MP3 for browser compatibility.
- Keep audio filename as `audio.mp3` inside each chapter/section folder.
- Use relative paths only.
- Avoid very large audio files if possible.
- If audio is too large for GitHub, split it by section.
- Never expect autoplay.
- Do not move old audio files without updating `chapters.json`.

---

## JavaScript implementation notes

Keep `app.js` simple and static-site friendly.

Recommended functions/concepts:

- `loadChapters()` — fetch `chapters.json`.
- `renderHome(chapters)` — render chapter cards.
- `getQueryParams()` — read `chapter` and `section`.
- `loadSection(chapterId, sectionId)` — fetch text/audio/timings.
- `renderSegments(segments)` — create clickable sentence spans.
- `findActiveIndex(currentTime)` — binary search or efficient scan for current audio time.
- `updateHighlight()` — update `.active` and `.played` classes.
- `formatTime(seconds)` — display readable audio time.

Avoid overengineering. Do not add React/Vue/Svelte unless the user specifically asks.

---

## Accessibility and usability

Maintain:

- Large readable text.
- Strong contrast between text and paper background.
- Keyboard-accessible buttons and links.
- Clear current-sentence highlighting.
- Mobile-friendly controls.
- Visible back link from chapter page to home.
- Native audio controls for browser accessibility.

Optional improvements that fit the project:

- Font size controls.
- Reading speed controls.
- Dark mode that still feels like a book.
- Search within chapter.
- Progress memory using `localStorage`.
- “Continue reading” on the home page.

---

## GitHub Pages constraints

This must remain compatible with GitHub Pages:

- Static files only.
- No server-side code.
- No database.
- No required build step.
- No absolute local paths like `/mnt/data/...`.
- Use relative URLs.
- Keep filenames stable and URL-safe.

Local testing should use a static server because JSON fetch may fail from `file://`:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

---

## Quality checklist before handing work back

Before finishing any change, check:

- Home page loads.
- Chapter list appears.
- Chapter card links work.
- Chapter page loads selected section.
- Audio source path is valid.
- Text appears in book style.
- Highlighting follows audio.
- Clicking a sentence seeks audio.
- Auto-scroll toggle works.
- Mobile layout still looks good.
- `chapters.json` is valid JSON.
- GitHub Pages uses only relative paths.
- Old chapter URLs still work.

---

## Communication style for future agents

The user prefers practical, directly usable outputs.

When reporting changes:

- Be concise.
- Provide the changed files or a zip.
- Mention exactly how to upload to GitHub Pages.
- Avoid long theoretical explanations.
- If timing is approximate, say so clearly.
- If a file is ready to upload, say that clearly.

