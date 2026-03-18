# Template Structure Map

**Document Title:** Plantilla Binpar
**Template ID:** `1yQYjm1GEbPy7Fmz4vz0U2WzsyWG7ZriVP1aGuYCenmA`
**Template URL:** https://docs.google.com/document/d/1yQYjm1GEbPy7Fmz4vz0U2WzsyWG7ZriVP1aGuYCenmA/edit

> **Important:** The indices below are from the template. After copying it, you MUST re-read the new document via `gws docs documents get` to get fresh indices — they may differ slightly.

## Named Styles

| Style | Font | Size | Notes |
|-------|------|------|-------|
| TITLE | Poppins | 60pt | Orange (R=1, G=0.6, B=0) |
| SUBTITLE | Poppins | 15pt | White text on cover, dark in content |
| HEADING_1 | Poppins | 38pt | Dark purple (R=0.13, G=0.07, B=0.30) |
| HEADING_2 | Poppins | 14pt | Section headings |
| HEADING_3 | Poppins | 10.5pt | Sub-section headings |
| NORMAL_TEXT | Roboto | 10.5pt | Body text |

## Document Sections

The document has 4 sections separated by page breaks:

1. **Cover page** (indices ~0–330)
2. **Table of contents** (indices ~330–529)
3. **Main content** (indices ~529–2329)
4. **Closing page** (indices ~2329–2348)

---

## Section 1: Cover Page (0–330)

| Element | Type | Indices | Content | Action |
|---------|------|---------|---------|--------|
| Empty title line | TITLE | 1–2 | `\n` (empty, 62pt orange) | SKIP — keeps spacing |
| **Document title** | TITLE | 2–24 | `Título del documento.\n` | REPLACE text (2–23) |
| **Subtitle** | SUBTITLE | 24–154 | `Subtítulo descriptivo con lorem ipsum...` | REPLACE text (24–153) |
| **Abstract box** | TABLE 1x1 | 154–329 | Cell text at 157–327: `Abstract en el caso de que sea necesario...` | REPLACE cell text (157–327) |
| Empty line | NORMAL_TEXT | 329–330 | `\n` | SKIP |

### Cover page positioned object
- **Logo** (kix.7b0scx6jy408): Small BinPar logo, WRAP_TEXT, ~95x46 PT. **Do not modify.**

---

## Section 2: Table of Contents (330–529)

| Element | Type | Indices | Content | Action |
|---------|------|---------|---------|--------|
| Section break | NEXT_PAGE | 330–331 | — | SKIP |
| **TOC title** | NORMAL_TEXT (styled 38pt bold Poppins) | 331–339 | `Índice.\n` | KEEP or rename |
| **TOC subtitle** | SUBTITLE | 339–375 | `Secciones incluidas en este informe\n` | KEEP or rename |
| Empty lines | NORMAL_TEXT | 375–377 | `\n\n` | SKIP |
| **Table of Contents** | tableOfContents | 377–517 | Auto-generated from headings | DO NOT MODIFY — auto-updates |
| Empty lines | NORMAL_TEXT | 517–528 | 11 empty paragraphs | SKIP |

> The TOC updates automatically when headings change. No manual replacement needed.

---

## Section 3: Main Content (529–2329)

This is the primary content area. The template shows a sample structure with two H1 pages.

### Page 1 content

| Element | Type | Indices | Content | Action |
|---------|------|---------|---------|--------|
| **H1 title** | HEADING_1 | 529–537 | `Título.\n` | REPLACE text |
| **Section subtitle** | SUBTITLE | 537–570 | `Subtítulo de sección del informe\n` | REPLACE text |
| **H2 heading** | HEADING_2 | 570–604 | `Título de sección (Encabezado 2)\n` | REPLACE text |
| **H3 heading** | HEADING_3 | 604–635 | `Título de texto (encabezado 3)\n` | REPLACE text |
| **Body text** | NORMAL_TEXT | 635–1082 | Lorem ipsum (447 chars) | REPLACE text |
| Empty line | NORMAL_TEXT | 1082–1083 | `\n` | SKIP |
| **H2 heading** | HEADING_2 | 1083–1106 | `Título (Encabezado 2)\n` | REPLACE text |
| **Body text** | NORMAL_TEXT | 1106–1255 | Lorem ipsum (149 chars, grey Roboto) | REPLACE text |
| Empty line | NORMAL_TEXT | 1255–1256 | `\n` | SKIP |
| **H3 heading** | HEADING_3 | 1256–1277 | `Tabla (encabezado 3)\n` | REPLACE text |
| Empty line | NORMAL_TEXT | 1277–1278 | `\n` | SKIP |

### Data Table (1278–1376)

4 rows x 2 columns:

| Row | Col 0 (Area) | Col 1 (Resumen) | Background |
|-----|-------------|-----------------|------------|
| Header | `Área` | `Resumen de situación` | Grey #d9d9d9 |
| Row 1 | `Nombre` | `Descripción` | Light grey #f3f3f3 |
| Row 2 | `Nombre` | `Descripción` | Light grey #f3f3f3 |
| Row 3 | `Nombre` | `Descripción` | Light grey #f3f3f3 |

**Action:** Replace cell text content. To add/remove rows, use table insert/delete requests.

### After table

| Element | Type | Indices | Content | Action |
|---------|------|---------|---------|--------|
| Empty lines | NORMAL_TEXT | 1376–1380 | 4x `\n` | SKIP |
| Empty H2 | HEADING_2 | 1380–1381 | `\n` (empty heading) | DELETE or use for new heading |
| Empty lines | NORMAL_TEXT | 1381–1383 | 2x `\n` | SKIP |

### Page 2 content

| Element | Type | Indices | Content | Action |
|---------|------|---------|---------|--------|
| **H1 title** | HEADING_1 | 1383–1392 | `Título 2\n` | REPLACE text |
| **Section subtitle** | SUBTITLE | 1392–1431 | `subtítulo de muestreo para la página 2\n` | REPLACE text |
| Empty lines | NORMAL_TEXT | 1431–1433 | 2x `\n` | SKIP |
| **Body text** | NORMAL_TEXT | 1433–1880 | Lorem ipsum (447 chars) | REPLACE text |
| Empty line | NORMAL_TEXT | 1880–1881 | `\n` | SKIP |
| **Body text** | NORMAL_TEXT | 1881–2328 | Lorem ipsum (447 chars) | REPLACE text |
| Empty line | NORMAL_TEXT | 2328–2329 | `\n` | SKIP |

---

## Section 4: Closing Page (2329–2348)

| Element | Type | Indices | Content | Action |
|---------|------|---------|---------|--------|
| Section break | NEXT_PAGE | 2329–2330 | — | SKIP |
| **BinPar logo** | InlineObject | 2330–2332 | Image kix.ugxks0htiyeh, 196x95 PT | DO NOT MODIFY |
| **URL** | NORMAL_TEXT | 2332–2347 | `www.binpar.com\n` | KEEP |
| Empty line | NORMAL_TEXT | 2347–2348 | `\n` | SKIP |

---

## Headers

| Header ID | Section | Content | Action |
|-----------|---------|---------|--------|
| `kix.rsjxarp70wyk` | Cover page (default) | Empty | SKIP |
| `kix.rntx6ipllkyy` | TOC page | 1x2 table: Cell[0,0] = `Fecha: [Insertar Fecha]\nCliente: xxxxxx` | REPLACE date and client name |
| `kix.r9zg8nhnmtnt` | Closing page | Empty | SKIP |

### Header table detail (kix.rntx6ipllkyy)

The TOC page header contains a 1-row, 2-column table:
- **Cell [0,0]:** Two lines: `Fecha: [Insertar Fecha]` and `Cliente: xxxxxx` — REPLACE with actual date and client
- **Cell [0,1]:** Empty

## Footers

| Footer ID | Section | Content | Action |
|-----------|---------|---------|--------|
| `kix.cn3tov4b4d2i` | Cover page (default) | 2x1 table: Row 0 = `Nombre del autor un nombre`, Row 1 = `Noviembre de 2025` | REPLACE author name and date |
| `kix.kct3b4xvoetd` | TOC page | Empty | SKIP |
| `kix.gna5zfaxmiqp` | Main content | Empty | SKIP |
| `kix.ip8fnicgob9m` | Closing page | Empty | SKIP |

### Cover footer table detail (kix.cn3tov4b4d2i)

2 rows x 1 column:
- **Row 0:** `Nombre del autor un nombre` — REPLACE with author name
- **Row 1:** `Noviembre de 2025` — REPLACE with document date

---

## Replacement Strategy

### Order of operations (END to START)

When replacing content, process from the highest indices to the lowest to prevent index shifting:

1. Footer (cover page) — author name and date
2. Header (TOC page) — date and client name
3. Main content page 2 — body text, subtitle, H1 title (from end to start)
4. Data table — cell contents (from last row to first)
5. Main content page 1 — body text, headings, subtitle, H1 title (from end to start)
6. Cover page — abstract, subtitle, title (from end to start)

### For each text replacement

```
deleteContentRange: { startIndex: TEXT_START, endIndex: TEXT_END }  // delete text only, keep \n
insertText: { location: { index: TEXT_START }, text: "New content" }  // inherits paragraph style
```

The `\n` paragraph mark must be preserved — it carries the paragraph's formatting. So for a paragraph at indices [635-1082] where the text is at [635-1081] and `\n` is at [1081-1082]:
- Delete range: 635 to 1081 (NOT 1082)
- Insert at: 635

### Adding or removing sections

The template has 2 H1 sections. If the document needs more or fewer:
- **More sections:** Insert new paragraphs with appropriate heading styles after the last content paragraph
- **Fewer sections:** Delete the unused section's content (headings + body) while preserving the closing page

### Table modifications

To add rows to the data table, use `insertTableRow` request. To modify existing cells, use `deleteContentRange` + `insertText` on each cell's text range.
