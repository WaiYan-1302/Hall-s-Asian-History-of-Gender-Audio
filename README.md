# Reading Audiobook Library

A static GitHub Pages audiobook-reading site for weekly course readings.

## What is included

- `index.html` — home page with chapter list
- `chapter.html` — reusable chapter reader page
- `styles.css` — shared book-style design
- `app.js` — shared logic for chapter loading, audio timing, highlighting, and click-to-seek
- `chapters.json` — table of contents
- `chapters/chapter-02-japan/` — the current Japan reading
- `AGENTS.md` — instructions for future coding agents

## Upload to GitHub Pages

1. Extract the zip file.
2. Create a GitHub repository.
3. Upload **all extracted files and folders** to the root of the repository.
4. Go to **Settings → Pages**.
5. Choose **Deploy from a branch**.
6. Choose branch: `main`, folder: `/root`.
7. Save.

Your site will open from the GitHub Pages URL after deployment.

## Add a new chapter later

Create a new folder:

```text
chapters/chapter-03-korea/
├─ text.txt
├─ audio.mp3
└─ timings.json
```

Then add a new entry to `chapters.json`:

```json
{
  "id": "chapter-03-korea",
  "title": "Korea",
  "subtitle": "Early Modern East Asia Reading",
  "folder": "chapters/chapter-03-korea",
  "dateAdded": "2026-06-27",
  "status": "ready",
  "sections": [
    {
      "id": "full",
      "title": "Full Korea Section",
      "text": "chapters/chapter-03-korea/text.txt",
      "audio": "chapters/chapter-03-korea/audio.mp3",
      "timings": "chapters/chapter-03-korea/timings.json"
    }
  ]
}
```

## Add a chapter with subchapters

Use this folder structure:

```text
chapters/chapter-04-example/
├─ section-01/
│  ├─ text.txt
│  ├─ audio.mp3
│  └─ timings.json
└─ section-02/
   ├─ text.txt
   ├─ audio.mp3
   └─ timings.json
```

Then add multiple section entries in `chapters.json`.

## Local testing

Do not test by double-clicking `index.html`, because browser fetch rules may block JSON loading.

Use:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```
