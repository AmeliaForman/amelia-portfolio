# Amelia Forman — Portfolio Site

A zero-build static site. No framework, no npm, no compile step.
Everything a visitor sees comes from **one file**: `content/projects.json`.

## How the site works

```
index.html      homepage (project index)
project.html    project detail page (project.html?p=<slug>)
about.html      bio + contact
css/style.css   all styling
js/site.js      reads projects.json and renders the pages
content/projects.json   ← ALL text content lives here
images/<slug>/  ← one folder of JPEGs per project
```

## Adding a new project (the only routine task)

1. Make a folder `images/your-project-slug/` (lowercase, hyphens, no spaces).
2. Put images in it:
   - `cover.jpg` — the shot shown on the homepage index
   - `01.jpg`, `02.jpg`, `03.jpg`, ... — the project page images, in order
   - Aim for ≤ 2400px on the long edge, JPEG quality ~85.
3. Open `content/projects.json` and add a block to the **top** of the
   `projects` array (top of array = top of homepage):

```json
{
  "slug": "your-project-slug",
  "title": "Project Name",
  "location": "New York, NY",
  "year": "2026",
  "type": "Residential",
  "scope": "Full renovation",
  "description": "One short paragraph about the project.",
  "images": [
    { "file": "01.jpg", "caption": "Living room, looking south" },
    { "file": "02.jpg", "caption": "" }
  ]
}
```

4. Commit and push (or ask Claude to). GitHub Pages redeploys
   automatically in about a minute.

### If you're Claude, reading this

You are the maintenance system for this site. When Amelia asks for a change:
- Content changes (new project, edit text, reorder) → edit `content/projects.json` only.
- Never rename `cover.jpg` or the numbered image convention.
- Validate the JSON before committing (`python -m json.tool content/projects.json`).
- Keep design edits in `css/style.css`; don't restructure the HTML/JS unless asked.

## Editing text, reordering, removing

All in `content/projects.json`:
- Reorder projects → reorder the array.
- Remove a project → delete its block (folder can stay or go).
- Bio, tagline, email, Instagram → the `site` object at the top.

## Previewing locally

From this folder:

```
python3 -m http.server 8000
```

Open http://localhost:8000. (Opening index.html directly via file:// will
not work — the JSON fetch needs a server.)

## First-time content population

Run `extract_pdf_images.py` against the portfolio PDF (instructions at the
top of that file), review `extracted/`, sort images into `images/<slug>/`
folders, and fill in `projects.json`. The three entries currently in the
JSON are placeholders — replace them.
