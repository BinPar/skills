---
name: binpar-documents
description: >
  Generates branded BinPar PDF documents (A4) locally: write Markdown with a small
  frontmatter and get a finished PDF with dark cover, automatic index with page numbers,
  numbered chapters, BinPar footer, tables, callouts, KPI cards, charts and back cover; or
  design a free-layout HTML page (one-pager, fact sheet, certificate, poster) and print it
  with the brand fonts and CSS injected. Zero npm installs: Node 22+ and any Chrome/Chromium.
  Use whenever a BinPar PDF is needed: proposals, reports, informes, memos, minutes,
  technical documents, one-pagers, job briefs or technical tests, or when converting
  Markdown/HTML into a BinPar-branded PDF. Applies binpar-brand-design-system visuals; write
  the text with binpar-brand-voice.
---

# BinPar documents (PDF)

Markdown or HTML in, branded A4 PDF out. The layout follows the identity manual v1.0:
Sora headlines in navy (teal second tone), Plus Jakarta Sans text in slate, cyan hairlines,
teal eyebrows, light reading pages, night-blue cover and back cover.

```bash
node <skill>/scripts/render.mjs input.md -o output.pdf --preview /tmp/preview
```

`<skill>` is this skill's directory. Requirements: Node ≥ 22 and Chrome, Chromium, Edge or
Brave installed (or `npx playwright install chromium`, or `BINPAR_CHROME=/path/to/chrome`).
No `npm install`: the Markdown parser and Paged.js are vendored in `scripts/vendor/`.

## Workflow

1. **Content.** Write the Markdown applying `binpar-brand-voice` (Spanish es-ES; see its
   `references/formats.md` for proposals, reports, minutes…). Start from
   `assets/templates/propuesta.md` for the syntax.
2. **Render with previews**: `--preview <dir>` writes one PNG per page.
3. **Look at every preview** (Read the PNGs). Fix and re-render when you see: a chapter
   with a single orphan line on a page, a table or chart cut badly, an empty page, overflowing
   text, a KPI row wrapping awkwardly, more than one yellow element.
4. **Deliver** the PDF path. Keep the `.md` next to it so it can be edited and re-rendered.

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
short_title: Propuesta · Medicina Interna   # footer text (default: title)
cover: dark                       # dark (default) | light
toc: auto                         # auto (≥ 3 chapters) | true | false
toc_depth: 2                      # 1 = chapters only
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
| `# Chapter` | New page, numbered eyebrow `01`, Sora 800 navy title; feeds the index and the footer |
| `## Section`, `### Sub` | Sora 800 / Sora 600 navy |
| `#### Label` | Teal Sora eyebrow (small caps) |
| `==text==` | In headings: second tone. In running text: soft teal mark |
| Paragraph right after `# Chapter` | Larger lede |
| `> text` | Pull quote (Sora, teal rule) |
| `> [!NOTE]` / `[!TIP]` + text | Ice callout, teal label "Nota" / "Recomendación" |
| `> [!IMPORTANT]` | Navy-tinted callout |
| `> [!WARNING] Custom title` | Callout with a yellow edge: **max one per document** |
| GFM tables (`---:` aligns right) | Teal small-caps header, cyan hairlines, tabular figures, header repeats on page breaks |
| Lists, `**bold**`, `` `code` ``, links, images | Styled; images get rounded corners |
| `{{assets}}/logos/…` | Absolute path to this skill's assets |

Raw HTML is allowed for richer blocks:

```html
<div class="kpis">
  <div class="kpi"><b>12 semanas</b><span>Desde el arranque hasta el uso en consulta</span></div>
</div>
<div class="cards"><div class="card"><h4>Título</h4><p>Texto</p></div></div>
<div class="chart"><p class="eyebrow">Benchmark</p><p class="chart-title">Título</p><svg>…</svg></div>
<figure><img src="diagrama.png"><figcaption>Fuente: …</figcaption></figure>
<div class="signature"><div><b>Por BinPar</b>Nombre y cargo</div><div><b>Por el cliente</b>Nombre y cargo</div></div>
<div class="page-break"></div>   <div class="keep">…never split…</div>
```

Leave a blank line before and after each HTML block. Charts: inline SVG following
`binpar-brand-design-system/references/charts.md` (one protagonist series in teal `#006D79`,
support bars `#CAD5E2`, dashed grid `rgb(0 117 149 / 18%)`, 10–11 px labels, Spanish number
format). Relative image paths resolve from the Markdown file's folder.

## Free-layout HTML (one-pagers, fact sheets, posters)

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
| `No Chromium-based browser found` | Install Chrome, or `npx playwright install chromium`, or set `BINPAR_CHROME` |
| `⚠ Images not loaded` | Wrong relative path (relative to the .md/.html file) |
| Fonts look like system fonts | Don't override `font-family`; use `var(--bp-font-display)` / `var(--bp-font-body)` |
| Index page numbers wrong after editing | Re-render; numbers are computed at render time |
| A block splits across pages | Wrap it in `<div class="keep">` or add `<div class="page-break"></div>` before |
| Need the composed HTML | `--html out.html` |
