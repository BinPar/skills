---
name: doc-generator
description: >
  Use this skill when the user asks to generate a document, create a proposal,
  draft a report, create a Google Doc, write a project specification, generate
  a BinPar document, or describes content that should be produced as a formatted
  Google Docs document. Also triggers when the user mentions creating deliverables,
  writing client-facing documents, or needs a professionally formatted document.
  Default language: Spanish. Auto-detect intent even when users don't explicitly
  ask for document generation.
---

# BinPar Document Generator

Generates Google Docs by copying BinPar's corporate template and intelligently replacing content while preserving all styling and formatting.

**IMPORTANT:** All `gws` commands MUST be prefixed with `CI=true` to disable the TUI and get plain JSON output. Example: `CI=true gws drive files list ...`

## Prerequisites Check

Before starting, verify GWS CLI is available:

```bash
which gws
```

If `gws` is not found, tell the user:
> "GWS CLI is not installed. Ask me to 'Set up BinPar tools' to install and configure it."

Then stop — do not proceed without GWS CLI.

Quick auth check:
```bash
CI=true gws auth status
```

If auth is expired, guide re-authentication (see binpar-setup skill).

## Template Information

- **Template Document ID:** `1yQYjm1GEbPy7Fmz4vz0U2WzsyWG7ZriVP1aGuYCenmA`
- **Structural map:** Read `references/template-structure.md` for the complete element mapping


The template has 4 sections:
1. **Cover page** — title (TITLE 60pt Poppins orange), subtitle (SUBTITLE 15pt white), abstract (1x1 table, 11pt white)
2. **Table of contents** — auto-generated from headings, updates automatically
3. **Main content** — H1/H2/H3 headings (Poppins), body text (Roboto 10.5pt), data table (4x2)
4. **Closing page** — BinPar logo + URL (do not modify)

Plus headers (date + client on TOC page) and footers (author + date on cover page).

## Document Generation Workflow

### Step A — Extract Information from User's Description

Parse the user's request to identify:
- **Document type:** proposal, report, specification, plan, etc.
- **Title:** main document title
- **Subtitle:** secondary title or tagline
- **Client name:** who the document is for
- **Author:** who is writing it (default: ask or use authenticated user)
- **Content points:** key topics, features, requirements the user mentioned
- **Date:** default to today in Spanish format (e.g., "Marzo de 2026")
- **Language:** default Spanish; adapt if user writes in another language

**Content tone by type:**
- Proposal → persuasive, benefit-focused
- Report → analytical, data-driven
- Specification → technical, precise
- Plan → structured, actionable

Ask for clarification only if critical information is genuinely ambiguous. Infer reasonable defaults for everything else.

### Step B — Ask for Destination Folder

Ask the user where to save the document in Google Drive.

If they provide a **URL**, extract the folder ID:
```
https://drive.google.com/drive/folders/{FOLDER_ID}
```

If they provide a **folder name**, search for it:
```bash
CI=true gws drive files list --params '{"q": "name = '\''Folder Name'\'' and mimeType = '\''application/vnd.google-apps.folder'\''", "pageSize": 5}'
```

If multiple matches, show them and ask the user to pick. If they don't care, omit `parents` (creates in Drive root).

### Step C — Copy the Template

```bash
CI=true gws drive files copy --params '{"fileId": "1yQYjm1GEbPy7Fmz4vz0U2WzsyWG7ZriVP1aGuYCenmA"}' --json '{"name": "DOCUMENT_TITLE", "parents": ["FOLDER_ID"]}'
```

This creates an exact copy preserving all formatting. The response JSON contains the new document `id`.

### Step D — Read the Document Structure

```bash
CI=true gws docs documents get --params '{"documentId": "NEW_DOC_ID"}'
```

Parse the returned JSON to build a replacement map. Cross-reference with `references/template-structure.md` to identify each content block. The key fields are:

- `body.content[]` — array of paragraphs, tables, section breaks
- Each paragraph has `paragraphStyle.namedStyleType` (TITLE, SUBTITLE, HEADING_1, etc.)
- Each text element has `startIndex`, `endIndex`, and `textRun.content`
- Tables have `tableRows[].tableCells[].content[]`
- Headers are in `headers` object, footers in `footers` object

**What to map from the fresh read:**

| Element | How to find | What to extract |
|---------|------------|-----------------|
| Cover title | TITLE paragraph, text != `\n` | startIndex, endIndex of text (exclude `\n`) |
| Cover subtitle | SUBTITLE paragraph after title | startIndex, endIndex of text (exclude `\n`) |
| Abstract | First TABLE (1x1), cell content | startIndex, endIndex of cell text |
| H1/H2/H3 headings | `namedStyleType` = HEADING_* | startIndex, endIndex of heading text |
| Body paragraphs | NORMAL_TEXT between headings, non-empty | startIndex, endIndex of text |
| Data table | Second TABLE (4x2) | Cell text indices per row/column |
| Header (TOC) | `headers["kix.rntx6ipllkyy"]` | Date and client text indices |
| Footer (cover) | `footers["kix.cn3tov4b4d2i"]` | Author name and date text indices |

### Step E — Generate Content for Each Section

Based on the user's description, generate content for every replaceable element:

1. **Cover page:** title, subtitle, executive summary/abstract
2. **Section headings:** renamed to match the document's actual topics
3. **Body text:** substantive content for each section (not filler)
4. **Data table:** populated with relevant data (timelines, features, costs, etc.)
5. **Header:** date in format "DD de Mes de YYYY" and client name
6. **Footer:** author name and date in format "Mes de YYYY"

**Guidelines:**
- Professional, well-structured Spanish by default
- Match tone to document type
- Keep sections proportional to importance
- Use formal "usted" for client-facing documents
- Use concrete details from the user's description — no generic padding
- The template has 2 H1 sections — adapt as needed (add/remove sections based on content)

**Content structure rules — avoid walls of text:**

Every content page MUST use proper heading hierarchy to break up content. Never leave a full page as NORMAL_TEXT paragraphs only.

- **H2 headings** to separate major topics within an H1 section (e.g., "Cronograma", "Condiciones de pago", "Validez y garantía")
- **H3 headings** to introduce sub-topics or action items (e.g., "Siguiente paso", "Entregables")
- **Maximum 2-3 body paragraphs** between headings. If a section runs longer, break it up with an additional H3
- **Visual elements** (images, tables) should be paired with a heading that introduces them, not floating between plain text blocks
- **Bullet points** (`•`) for lists instead of inline enumeration. Use them for: payment terms, deliverables, feature lists, requirements
- **Data tables** for structured comparisons (budgets, timelines, feature matrices) — don't describe tabular data in prose

Example structure for a "Condiciones" section:
```
H1: Condiciones
  SUBTITLE: Cronograma y términos del proyecto
  H2: Cronograma
    [timeline image]
    body: brief phase descriptions
  H2: Condiciones de pago
    body: bullet list of payment milestones
  H2: Validez y garantía
    body: terms, warranty, SLA
  H3: Siguiente paso
    body: call to action + contact
```

To add new headings to existing content, use `insertText` + `updateParagraphStyle`:

```json
{"insertText": {"location": {"index": TARGET}, "text": "Heading text\n"}},
{"updateParagraphStyle": {
  "range": {"startIndex": TARGET, "endIndex": TARGET + LENGTH},
  "paragraphStyle": {"namedStyleType": "HEADING_2"},
  "fields": "namedStyleType"
}}
```

Process these from END to START like all other operations to prevent index shifting.

### Step F — Replace Content via batchUpdate

Build batchUpdate requests processing **from END to START** of the document. This prevents index shifting.

For each text block to replace:

1. **Delete** the existing text (keep the `\n` paragraph mark to preserve styling):
   ```json
   {"deleteContentRange": {"range": {"startIndex": TEXT_START, "endIndex": TEXT_END_BEFORE_NEWLINE}}}
   ```

2. **Insert** new text (inherits paragraph formatting):
   ```json
   {"insertText": {"location": {"index": TEXT_START}, "text": "New content here"}}
   ```

**Replacement order (end to start):**
1. Footer table — author name, then date
2. Header table — client name, then date
3. Main content page 2 — body paragraphs → subtitle → H1 title
4. Data table — last row to first row, each cell
5. Main content page 1 — body paragraphs → H3 → H2 → subtitle → H1 title
6. Cover page — abstract cell → subtitle → title

Execute:
```bash
CI=true gws docs documents batchUpdate --params '{"documentId": "NEW_DOC_ID"}' --json '{
  "requests": [
    {"deleteContentRange": {"range": {"startIndex": HIGHEST_START, "endIndex": HIGHEST_END}}},
    {"insertText": {"location": {"index": HIGHEST_START}, "text": "New text"}},
    ... (descending by index)
    {"deleteContentRange": {"range": {"startIndex": LOWEST_START, "endIndex": LOWEST_END}}},
    {"insertText": {"location": {"index": LOWEST_START}, "text": "New text"}}
  ]
}'
```

**Rules:**
- Always process highest indices first
- Never delete the `\n` at the end of a paragraph — it carries formatting
- For table cells: delete cell text, insert new text at cell text start
- If batch is large (>30 operations), split into multiple calls (still end-to-start per call)
- Headers and footers have their own index spaces — they can be updated in any order relative to body content

### Step F.1 — Insert Images (Chronograms, Diagrams, Charts)

When the document benefits from visual elements (timelines, Gantt charts, diagrams, data visualizations), generate and insert them as inline images.

#### Available tools

- **Pillow (PIL)** — available on this system. Use `ImageDraw` for shapes, text, lines, and rectangles. Good for Gantt charts, timelines, simple diagrams.
- **matplotlib** — NOT available. Do not attempt to use it.
- **SVG conversion** — no `cairosvg`, `rsvg-convert`, or ImageMagick available. Generate PNG directly with Pillow.

#### Image generation guidelines

- Create images at 2x resolution for sharpness (e.g., 1800×520 for a timeline that will display at ~468 PT wide)
- Use BinPar brand colors: orange `(255, 153, 0)`, dark purple `(33, 18, 77)`, medium purple `(100, 70, 180)`
- Use system fonts: `/System/Library/Fonts/Helvetica.ttc` (macOS)
- White background `(255, 255, 255)` for clean integration with the document
- Save as PNG to a temporary file **inside the working directory** (the `--upload` flag rejects paths outside the current directory)

#### Upload to Google Drive

```bash
# 1. Save image to working directory (NOT /tmp — gws rejects external paths)
cp /tmp/image.png ./image.png

# 2. Upload
CI=true gws drive files create \
  --json '{"name": "image_name.png", "mimeType": "image/png"}' \
  --upload image.png

# 3. Make publicly accessible (required for insertInlineImage)
CI=true gws drive permissions create \
  --params '{"fileId": "IMAGE_FILE_ID"}' \
  --json '{"role": "reader", "type": "anyone"}'

# 4. Clean up local file
rm ./image.png
```

#### Re-read document indices

After any previous batchUpdate, indices will have shifted. Always re-read:

```bash
CI=true gws docs documents get --params '{"documentId": "DOC_ID"}'
```

Find the target paragraph index where the image should be inserted.

#### Insert the image

Use `insertInlineImage` in a batchUpdate. The image URL format for Google Drive is:

```
https://drive.google.com/uc?export=download&id=IMAGE_FILE_ID
```

Size the image to fit the document width (~468 PT) and calculate height proportionally:

```
display_height = 468 × (original_height / original_width)
```

```bash
CI=true gws docs documents batchUpdate --params '{"documentId": "DOC_ID"}' --json '{
  "requests": [
    {
      "insertInlineImage": {
        "uri": "https://drive.google.com/uc?export=download&id=IMAGE_FILE_ID",
        "location": {"index": TARGET_INDEX},
        "objectSize": {
          "width": {"magnitude": 468, "unit": "PT"},
          "height": {"magnitude": CALCULATED_HEIGHT, "unit": "PT"}
        }
      }
    }
  ]
}'
```

**Placement tips:**
- Insert into an empty paragraph (`\n` only) to avoid mixing with text
- If no empty paragraph exists at the desired location, insert a `\n` first to create one, then re-read indices
- The image becomes an inline element within the paragraph at the target index

#### When to add images

Proactively suggest adding visual elements when the document contains:
- **Timelines/chronograms** — Gantt-style horizontal bar charts
- **Budget breakdowns** — bar or pie-style charts
- **Process flows** — step diagrams with arrows
- **Comparison tables** — when a visual would communicate better than a text table

### Step G — Get Document URL and Present Result

```bash
CI=true gws drive files get --params '{"fileId": "NEW_DOC_ID", "fields": "id,name,webViewLink"}'
```

Present:
- The document URL (webViewLink)
- Brief summary: title, sections generated, key content
- Remind user to review and adjust as needed

## Error Handling

| Error | Solution |
|-------|----------|
| `gws` not found | Tell user: "Ask me to 'Set up BinPar tools'" |
| Auth expired | Run `CI=true gws auth login` — extract and show URL to user |
| Template not accessible | Check sharing permissions; verify template ID |
| batchUpdate index error | Re-read document (Step D) for fresh indices, then retry |
| Rate limit | Wait briefly, retry the failed command |
| Large document timeout | Split batchUpdate into smaller batches |

If a batchUpdate fails, always re-read the document structure (Step D) before retrying — indices will have changed.
