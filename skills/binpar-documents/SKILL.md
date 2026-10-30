---
name: binpar-documents
description: >
  Generates branded BinPar PDF documents (A4) locally: write Markdown with a small
  frontmatter and the postext typesetter turns it into a finished PDF with dark cover,
  automatic index, numbered chapters, BinPar footer, tables that split cleanly, callouts,
  figures, charts, clickable links and back cover; or design a free-layout HTML page
  (one-pager, fact sheet, certificate, poster) and print it with headless Chrome and the
  brand fonts and CSS injected.
  Use whenever a BinPar PDF is needed: proposals, reports, informes, memos, minutes,
  technical documents, one-pagers, job briefs or technical tests, or when converting
  Markdown/HTML into a BinPar-branded PDF. Applies binpar-brand-design-system visuals; write
  the text with binpar-brand-voice.
---

# BinPar documents (PDF)

Markdown or HTML in, branded A4 PDF out. The layout follows the identity manual v1.0:
Sora headlines in navy (teal second tone), Plus Jakarta Sans text in slate, cyan hairlines,
teal eyebrows, light reading pages, night-blue cover and back cover.

**Markdown documents always go through postext** ([postext.dev](https://postext.dev)), a
typesetter with editorial rules: a heading never stays alone at a page foot, widows and
orphans are avoided, long tables split between rows with the header repeated, and links
stay clickable. Use the Chrome renderer only for free-layout HTML pages.

```bash
python3 <skill>/scripts/postext/build_book.py input.md -o /tmp/book --pdf output.pdf --images /tmp/pages
```

`<skill>` is this skill's directory. The command writes a postext book folder (`-o`), runs
`postext check` on it, and prints its warnings; `--pdf` and `--images` (one PNG per page) are
optional. `postext pack /tmp/book -o output.postext` gives the editable bundle, which opens in
the postext Sandbox.

## Requirements

- Python 3 (standard library only).
- The `postext` command line, ≥ 1.57: one self-contained file per system, no installation.
  ```bash
  mkdir -p ~/.local/bin && curl -fL -o ~/.local/bin/postext https://github.com/drnachio/postext/releases/latest/download/postext-macos-arm64 && chmod +x ~/.local/bin/postext
  ```
  Other systems: `postext-macos-x64`, `postext-linux-x64`, `postext-linux-arm64`,
  `postext-windows-x64.exe`. With Node, `npx postext-cli` works too.
- Free-layout HTML only: Node ≥ 22 and Chrome, Chromium, Edge or Brave (or
  `npx playwright install chromium`, or `BINPAR_CHROME=/path/to/chrome`).

## Workflow

1. **Content.** Write the Markdown applying `binpar-brand-voice` (Spanish es-ES; see its
   `references/formats.md` for proposals, reports, minutes…). Start from
   `assets/templates/propuesta.md` for the syntax.
2. **Build with page images** (`--images <dir>`) and read the `postext check` warnings.
   Fix every `designTextTruncated` (footer text too long: shorten `short_title` or the
   chapter title) and every word cut by a hyphen in a narrow table column.
3. **Look at every page** (Read the PNGs, or a contact sheet of them). Fix and rebuild when
   you see: a table column too narrow, an empty page, overflowing text, a table that would
   read better split in two, more than one yellow element.
4. **Deliver** the PDF path. Keep the `.md` next to it so it can be edited and rebuilt.

## The template

`assets/postext/config.json` is the BinPar template: the `config` of every postext book this
skill builds. It is the source of truth; edit it directly, or in the postext Sandbox and
copy the exported `config` back. It holds A4 geometry, palette, fonts, cover, chapter
openers, index, footer, callouts, tables and figure types. `scripts/postext/build_book.py`
adds the per-document parts (chapters, tables as resources, figures, fonts, logos) and the
frontmatter switches `numbered` and `chapter_breaks`.

## Markdown documents

### Frontmatter

```yaml
---
title: Consulta clínica con ==evidencia visible.==   # ==…== = second tone (teal)
eyebrow: Propuesta técnica       # document type, shown above the title (default "Documento")
subtitle: One-sentence lede for the cover.
client: Hospital Universitario X
version: "1.0"                    # quote it
date: 29 de octubre de 2026       # default: today, in Spanish
author: Equipo de BinPar          # default "BinPar"
confidential: true                # or a custom label ("Uso interno")
short_title: Propuesta · Medicina Interna   # footer text (default: title); keep ≤ 35 characters
toc: auto                         # auto (≥ 3 chapters) | true | false
numbered: true                    # 01, 02… above chapter titles
chapter_breaks: true              # false = chapters flow without page breaks (short docs)
backcover: true
contact: binpar.com               # back-cover line
---
```

Only `title` is required (or a first `# H1`, which then becomes the title). Values are
single-line `key: value`.

### Structure and syntax

| Write | Get |
|---|---|
| `# Chapter` | New page, numbered eyebrow `01`, Sora 800 navy title; feeds the index and the footer. Keep it ≤ 45 characters (footer label) |
| `## Section`, `### Sub` | Sora 800 / Sora 700 navy |
| `#### Label` | Teal Sora eyebrow (small caps) |
| `==text==` | In the title: second tone (teal). In running text: soft teal band |
| Paragraph right after `# Chapter` | Larger lede |
| `> text` | Pull quote (teal) |
| `> [!NOTE]` / `[!TIP]` + text | Ice callout, teal label "Nota" / "Recomendación" |
| `> [!IMPORTANT]` | Navy-tinted callout |
| `> [!WARNING] Custom title` | Callout with a yellow edge: **max one per document** |
| GFM tables (`---:` aligns right) | Teal small-caps header, hairlines, header repeated where the table splits |
| Lists, `**bold**`, `*italic*`, links | Links are teal in text and get a `↗` inside tables; all clickable |
| `![alt](file.png "Caption")` on its own line | Figure (PNG, JPEG or SVG) with caption |
| `<div class="page-break"></div>` | Page break |
| `{{assets}}/logos/…` | Absolute path to this skill's assets |

Markdown rules from postext: every list item is one line (no wrapped continuation lines),
and blockquotes cannot hold lists.

Raw HTML blocks are mapped as follows (leave a blank line before and after each one):

```html
<div class="kpis"><div class="kpi"><b>12 semanas</b><span>Desde el arranque…</span></div></div>   → two-column table
<div class="cards"><div class="card"><h4>Título</h4><p>Texto</p></div></div>                        → one callout per card
<div class="chart"><p class="chart-title">Título</p><svg>…</svg></div>                             → SVG figure, title as caption
<figure><img src="diagrama.png" alt="…"><figcaption>Fuente: …</figcaption></figure>                → figure with caption
<div class="signature"><div><b>Por BinPar</b>Nombre y cargo</div>…</div>                           → signature table
```

Any other HTML is dropped with a warning. Charts: inline SVG following
`binpar-brand-design-system/references/charts.md` (one protagonist series in teal `#006D79`,
support bars `#CAD5E2`, dashed grid `rgb(0 117 149 / 18%)`, 10–11 px labels, Spanish number
format). Relative image paths resolve from the Markdown file's folder.

## Free-layout HTML (one-pagers, fact sheets, posters)

Pages with a fixed design, not running text, are printed with headless Chrome:

```bash
node <skill>/scripts/render.mjs ficha.html -o ficha.pdf --preview /tmp/preview
```

Start from `assets/templates/one-pager.html`. The renderer injects the static brand fonts,
`tokens.css` and `components.css`, so the page can use every `bp-*` class
(`bp-eyebrow`, `bp-display`, `bp-accent`, `bp-lede`, `bp-card`, `bp-kpi`, `bp-tag`, `bp-grid`…)
and `var(--bp-*)` tokens. Rules:

- Declare `@page { size: A4; margin: 0 }` and give each page a `210mm × 297mm` box with
  `break-after: page`. Landscape: `size: A4 landscape` and swap the box.
- Keep content inside 15–20 mm margins; let the background (light, or night blue on a cover)
  bleed to the edge.
- Logo: `{{assets}}/logos/binpar-logo-light.svg` (dark surfaces: `-dark`), ≥ 8 mm high, with
  clear space.
- Print rules: light theme for reading; grid only faded and only at the top or on covers;
  no flaps; yellow at most once.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `postext CLI not found` | Install it (Requirements) and make sure `~/.local/bin` is on `PATH` |
| `designTextTruncated` in the footer | Shorten `short_title` or the chapter title |
| A word cut by a hyphen in a table column | Shorten the cell, drop a column whose values repeat, or split the table |
| `glyphFallback` | A character the brand fonts lack (emoji, rare symbols): replace it |
| `raw HTML dropped` | Use one of the mapped HTML blocks or plain Markdown |
| A section should open a new page | `<div class="page-break"></div>` before its heading |
| Free-layout HTML: `No Chromium-based browser found` | Install Chrome, or `npx playwright install chromium`, or set `BINPAR_CHROME` |
| Free-layout HTML: fonts look like system fonts | Don't override `font-family`; use `var(--bp-font-display)` / `var(--bp-font-body)` |
