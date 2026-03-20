---
name: doc-generator
description: >
  Use this skill when the user asks to generate a document, create a proposal,
  draft a report, create a Google Doc, create a Notion page, write a project
  specification, generate a BinPar document, or describes content that should
  be produced as a formatted document. Also triggers when the user mentions
  creating deliverables, writing client-facing documents, internal documents,
  or needs a professionally formatted document. Triggers on: "create a Notion
  page", "generate in Notion", "draft in Notion", "genera un documento",
  "crea una propuesta". Default language: Spanish. Auto-detect intent even
  when users don't explicitly ask for document generation.
---

# BinPar Document Generator

## Runtime Compatibility

This skill supports Claude Code and Codex as equal targets.

- For user choices, use AskQuestionTool or the current runtime's equivalent structured question/input mechanism when available.
- Prefer option-based prompts over free-text questions whenever possible.
- If no structured question tool is available, ask directly in chat.
- For Notion MCP management, use `claude mcp ...` in Claude Code and `codex mcp ...` in Codex.
- For Notion content operations, use the current runtime's official Notion MCP tools. In Codex, the expected mapping is `mcp__notion__notion_search` -> `mcp__notion__notion_fetch` -> `mcp__notion__notion_create_pages` or `mcp__notion__notion_update_page`.
- Do not assume older REST-style Notion tool names are present unless you have verified them in the current runtime.

Generates professional documents in **Google Docs** (corporate template, client-facing) or **Notion** (Docs database, internal/simpler documents).

**IMPORTANT:** All `gws` commands MUST be prefixed with `CI=true` to disable the TUI and get plain JSON output. Example: `CI=true gws drive files list ...`

## Prerequisites Check

Before starting, check which output backends are available. For Notion MCP, run only the command that matches the current runtime:

```bash
# Check Google Workspace CLI
which gws && CI=true gws auth status

# Check Notion MCP server in Claude Code
claude mcp list 2>&1 | grep -i notion

# Check Notion MCP server in Codex
codex mcp list 2>&1 | grep -i notion
```

- If `gws` is not found and the user wants Google Docs output → tell them: "Ask me to 'Set up BinPar tools' to install and configure it." Then stop.
- If Notion MCP is not registered and the user wants Notion output → tell them: "Ask me to 'Set up BinPar tools' and choose Notion setup." Then stop.
- If neither is available → tell them to run setup first. Then stop.
- If only one is available → skip the destination choice and use the available backend.

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

### Step A.1 — Ask Output Destination

If both Google Docs and Notion are available, ask where to generate the document. Use AskQuestionTool or the current runtime's equivalent structured question flow when available; otherwise ask directly in chat:

- **Google Docs** — Polished, corporate-template formatted document (recommended for client-facing)
- **Notion** — Structured page in the Docs database (recommended for internal documents)

If the user's request already specifies a destination (e.g., "create a Notion page", "genera un Google Doc"), skip the question and use what they asked for.

**Routing:**
- If **Google Docs** → continue with Step B (existing Google Docs flow)
- If **Notion** → jump to **Step N.1** (Notion flow)

---

## Google Docs Flow (Steps B–G)

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

---

## Notion Flow (Steps N.1-N.5)

Read `references/notion-generation.md` for detailed block patterns, database schema, and content mapping.

### Step N.1 — Verify Notion MCP Available

Confirm the Notion MCP tools are available in the current session. Try listing tools or making a simple search call.

If the Notion MCP server is not running:
> "Notion MCP is not available. Check the current runtime's MCP server list, or ask me to 'Set up BinPar tools' if you haven't configured it yet."

Then stop.

### Step N.2 — Locate Docs Database

Search for the "Docs" database in the connected space, then fetch the winning result to confirm its schema and creation target.

```
Codex example:
Tool: mcp__notion__notion_search
Arguments: { "query": "Docs", "query_type": "internal", "page_size": 10 }
```

If found:
- Fetch the candidate result to confirm it is the correct Docs database.
- When the runtime exposes a separate data source or collection concept, use that fetched `data_source_id` or `collection://...` target for page creation.

If multiple databases match → show options to the user and let them pick via AskQuestionTool or the current runtime's equivalent structured question flow. Fall back to direct chat only if needed.

If not found → ask the user to provide the database ID or URL:
> "I couldn't find a 'Docs' database in your connected Notion space. Please paste the database URL or ID, or tell me where to create the document."

Extract database ID from URL format: `https://www.notion.so/workspace/DATABASE_ID?v=...`

### Step N.3 — Generate Content

Generate content adapted for Notion's page/content model. Use the same content quality as Google Docs but with simpler formatting:

- **No cover page, no positioned logos** — Notion doesn't support this
- **Page icon:** set appropriate emoji based on doc type (see reference)
- **Headings:** H1/H2/H3 for structure
- **Body:** paragraphs, bulleted lists, numbered lists
- **Data:** tables for structured comparisons
- **Highlights:** callouts or equivalent highlighted sections for executive summaries and calls to action
- **Separators:** divider blocks or equivalent section separators
- **Professional Spanish by default** — same quality standards as Google Docs
- **Concrete details from the user's description** — no generic padding

Prefer a single structured content payload when the runtime supports it. In Codex, prefer Notion-flavored Markdown content passed during page creation. In other runtimes, use the equivalent current content model.

Follow the page structure patterns in `references/notion-generation.md` for each document type.

### Step N.4 — Create Page and Add Content

#### 1. Create the page in the Docs database or data source

Use the current runtime's page creation tool with:
- **Parent:** the Docs database or fetched data source target
- **Icon:** emoji matching document type
- **Properties:** Title, Client, Date, Author, Document Type
- **Content:** the generated Notion content payload when supported at create time

In Codex, prefer a single `mcp__notion__notion_create_pages` call with the fetched `data_source_id`, the exact property names from the fetched schema, and the full content body.

#### 2. Add or refine content if needed

If the runtime cannot create the full page content in one call, create the page first and then add or update content using the current runtime's update tool in as few calls as possible.

Build the full document top to bottom:

1. Executive summary / intro (callout + paragraphs)
2. Main sections (heading_1 → heading_2 → paragraphs/lists)
3. Data sections (tables)
4. Closing (divider → call-to-action callout)

### Step N.5 — Present Result

Present to the user:

- The Notion page URL (always show the full URL as text in the chat message)
- Brief summary: title, sections generated, database it was added to
- Remind the user they can edit and refine the page directly in Notion

---

## Error Handling

### Google Docs Errors

| Error | Solution |
|-------|----------|
| `gws` not found | Tell user: "Ask me to 'Set up BinPar tools'" |
| Auth expired | Run `CI=true gws auth login` — extract and show URL to user |
| Template not accessible | Check sharing permissions; verify template ID |
| batchUpdate index error | Re-read document (Step D) for fresh indices, then retry |
| Rate limit | Wait briefly, retry the failed command |
| Large document timeout | Split batchUpdate into smaller batches |

If a batchUpdate fails, always re-read the document structure (Step D) before retrying — indices will have changed.

### Notion Errors

| Error | Solution |
|-------|----------|
| Notion MCP not registered | Tell user: "Ask me to 'Set up BinPar tools' and choose Notion setup" |
| Notion MCP not running | Check the current runtime's MCP server status and re-authenticate if needed |
| Database not found | Ask user for the database ID or URL |
| Permission denied / unauthorized | Re-authorize the current runtime's `notion` MCP server, then select Read Garden during OAuth |
| Rate limited (429) | Wait 1-2 seconds and retry the failed call |
| Create-time content not supported | Switch to a create-then-update flow using the current runtime's Notion update tool |
