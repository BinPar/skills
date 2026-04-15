---
name: slides-generator-sermas
description: >
  Use this skill when the user asks for a Sermas, Comunidad de Madrid, Salud
  Digital, or Consejería de Digitalización branded Google Slides deck — or any
  healthcare / Madrid regional government presentation that should use the
  Sermas template. Triggers on: "crea una presentación sermas", "deck sermas",
  "presentación comunidad de madrid", "plantilla sermas", "sermas slides",
  "lanzamiento de proyecto sermas", "madrid salud digital slides",
  "presentación consejería digitalización". Default language: Spanish.
  Auto-detect intent when the content is clearly Madrid-regional or health-digital
  in origin.
  IMPORTANT: Sermas template is white-background, blue-accent (#2F5597),
  institutional in tone. Content slides are text-heavy by default;
  SVG visuals are optional and manually positioned.
  IMPORTANT: For decisions or confirmations, use AskQuestionTool or the current
  runtime's equivalent structured question/input mechanism when available,
  preferring option-based prompts over free-text questions whenever possible.
---

# Sermas Slides Generator

## Runtime Compatibility

This skill supports Claude Code and Codex as equal targets.

- For user choices, use AskQuestionTool or the current runtime's equivalent structured question/input mechanism when available.
- Prefer option-based prompts over free-text questions whenever possible.
- If no structured question tool is available, ask directly in chat.

Generates professional presentations in **Google Slides** using the Sermas / Comunidad de Madrid — Consejería de Digitalización template. The deck is institutional and text-forward; the skill duplicates a fixed set of template slides, fills text, and optionally inserts SVG visuals on content slides.

**IMPORTANT:** All `gws` commands MUST be prefixed with `CI=true` to disable the TUI and get plain JSON output. Example: `CI=true gws slides presentations get ...`

**Reference files** (read as needed during execution):
- `references/template-structure.md` — Complete slide and element catalog with objectIds
- `references/gws-slides-commands.md` — All Slides + Drive CLI commands with examples
- `references/svg-generation-guide.md` — SVG subagent instructions, Sermas brand kit, prompt templates
- `references/image-pipeline.md` — SVG→PNG conversion, upload, insertion, and cleanup

## Constants

- **Template ID:** `1shVwhiGRIgLml3TB9SUMsEW_OwS0HHDsuH2bb3MMaVc`
- **Page size:** 960 × 540 PT (13.333" × 7.5", 16:9 — PowerPoint widescreen)
- **Background:** `rgb(255, 255, 255)` — white
- **Primary accent:** `rgb(47, 85, 151)` — `#2F5597` Sermas blue
- **Text:** `rgb(0, 0, 0)` primary / `rgb(89, 89, 89)` muted
- **Title font:** Calibri (inherited from template)
- **Body font:** Arial (inherited from template)
- **Master layout for content:** `p9` ("1_Title Only") — inherits Comunidad de Madrid logo (top-right) + "Página" footer

## Presentation Design Principles

Sermas decks have a different aesthetic than a pitch deck — they are institutional, text-forward, and deliberately minimal. Follow these principles:

1. **Text over imagery.** Sermas content slides are primarily text (section numeral + title + bulleted body). Only add SVG visuals when the content clearly benefits (process flows, data, org structures) or when the user explicitly asks.
2. **One idea per slide.** Never cram multiple concepts into a single slide.
3. **Respect the template catalog.** The Sermas template ships with 6 slides in fixed roles — cover (`p1`), TOC (`p2`), content (`p3`/`p4`), ANEXO divider (`p5`), GRACIAS closing (`p6`). Duplicate `p3` for new content slides; duplicate `p5` for new section dividers; never mutate `p6`.
4. **TOC is capped at 8 sections.** Slide `p2` is a fixed 8-section grid. Decks with more must merge; decks with fewer must delete unused slots.
5. **Do not touch inherited branding.** The Comunidad de Madrid logo (top-right) and "Página" footer (bottom-left) live in layout `p9` and are inherited automatically — never try to move, replace, or delete them.

---

## Step 0: Prerequisites

### 0.1 Verify gws is installed and authenticated

```bash
CI=true gws drive files list --params '{"pageSize": 1}'
```

- If `gws` is not found → tell the user: "Ask me to 'Set up BinPar tools' to install and configure it." Then stop.
- If auth is expired → run `CI=true gws auth login`, extract the URL from the output, and display it as text in the chat so the user can click it.

### 0.2 Detect SVG converter (only if visuals are planned)

If the deck is likely to include SVG visuals, check which SVG→PNG converter is available (run once, remember the result):

```bash
python3 -c "import cairosvg; print('cairosvg')" 2>/dev/null \
  || (which inkscape 2>/dev/null && echo 'inkscape') \
  || (ls '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' 2>/dev/null && echo 'chrome') \
  || echo 'pillow-fallback'
```

If the deck will be text-only (most Sermas decks), skip this step.

---

## Step 1: Gather Requirements

Parse the user's request to extract:

| Field | Required | How to infer | If not inferable |
|-------|----------|-------------|-----------------|
| Project / deck title | Yes | From conversation | AskQuestionTool |
| Date line on cover | Yes | From user or current month | Default: "En Madrid, a [día] de [mes] de [año]" |
| Section list (for TOC and content) | Yes | Listed in request | AskQuestionTool — also confirm section count ≤ 8 |
| Content per section | Yes | User-provided bullets or prose | AskQuestionTool if none provided |
| Include SVG visuals? | No | Default: no (text-only deck) | Ask once |
| Speaker notes? | No | Default: no | Ask once |
| Destination folder | Yes | URL or name in request | AskQuestionTool |
| Language | Yes | User's language | Default Spanish |

**Rules:**
- Sermas decks have **no contact slide**. Do not ask for contact info. If the user volunteers it, mention that the Sermas template doesn't include a contact card.
- TOC is capped at 8 sections (hard limit of the template). If the user lists more, ask them to merge/drop until ≤ 8.
- If the user provides a folder URL, extract the folder ID: `https://drive.google.com/drive/folders/{FOLDER_ID}`
- If they provide a folder name, search for it:
  ```bash
  CI=true gws drive files list --params '{"q": "name = '\''Folder Name'\'' and mimeType = '\''application/vnd.google-apps.folder'\''", "pageSize": 5}'
  ```

---

## Step 2: Plan the Deck (Autonomous)

Based on the gathered requirements, plan the complete slide deck. This is done autonomously — do not ask the user to approve the slide plan.

### 2.1 Determine slide count

Typical Sermas deck: 6–14 slides.

- 1 cover (`p1`)
- 1 TOC (`p2`)
- 1 content slide per section (duplicated from `p3`) — usually 4–8
- Optional 1 ANEXO divider (`p5`) if annex content exists
- Optional 1–2 annex content slides (duplicated from `p3`)
- 1 closing (`p6`)

### 2.2 Fixed slide sequence

Every Sermas deck follows this exact structure:

| Position | Slide | Source | Editable? |
|----------|-------|--------|-----------|
| 1 | Cover | `p1` (edit in place) | Text only |
| 2 | TOC / INDICE | `p2` (edit in place) | Text in 8 section labels |
| 3…N | Content slides | Duplicate `p3` per section | Title + body |
| Optional | ANEXO divider | Duplicate `p5` | Divider text |
| Optional | Annex content slides | Duplicate `p3` | Title + body |
| Last | GRACIAS closing | `p6` (immutable) | Nothing |

### 2.3 Pick layout for each content slide

The Sermas template only offers one reusable content layout (slide `p3`: section numeral + section title + bulleted body). Every content slide will be a duplicate of `p3`, differing only in:
- Section numeral (01, 02, 03, …)
- Section title
- Body content (bullets)
- Optional inserted SVG visual

If richer layouts are required (two columns, big number, cards), they are **not available** in this template. Tell the user up-front that Sermas decks are single-column. Do not fall back to the Google-default predefined layouts (`TITLE_AND_TWO_COLUMNS`, etc.) — those ignore Sermas branding and produce jarring unstyled slides.

### 2.4 Plan visuals (optional)

Only if visuals were requested in Step 1, decide for each content slide:
- **Content diagram** (Category A) — flowcharts, architecture, process diagrams
- **Data visualization** (Category B) — bar charts, comparisons, metrics
- **Concept illustration** (Category C) — abstract visuals, icons
- **Timeline / process** (Category D) — step sequences, project phases

See `references/svg-generation-guide.md` for category details.

### 2.5 Internal plan structure

Build an internal plan (not shown to user) mapping each slide to:
- Position in final sequence (1-indexed)
- Source slide (`p1`, `p2`, `p3` duplicate, `p5` duplicate, `p6`)
- Content outline (numeral, title, body)
- Image needs if any (category, topic, dimensions, insertion coordinates)

---

## Step 3: Copy Template

```bash
CI=true gws drive files copy \
  --params '{"fileId": "1shVwhiGRIgLml3TB9SUMsEW_OwS0HHDsuH2bb3MMaVc"}' \
  --json '{"name": "PRESENTATION_TITLE", "parents": ["FOLDER_ID"]}'
```

Extract the new presentation `id` from the response. If the user doesn't care about the folder, omit `parents`.

---

## Step 4: Read Presentation Structure

```bash
CI=true gws slides presentations get --params '{"presentationId": "NEW_PRES_ID"}'
```

Parse the response to build a map of:
- All 6 slide objectIds (`p1`…`p6`)
- Every element objectId per slide (text boxes, shapes, images, groups)
- Layout references for each slide (`slideProperties.layoutObjectId`)
- Notes page element IDs (if speaker notes are requested)

Cross-reference with `references/template-structure.md` to identify each element's role. The starting objectIds (`p1_i18`, `p3_i17`, etc.) are stable until you start duplicating.

---

## Step 5: Structural Mutations

Build a single `batchUpdate` with duplications and optional deletions, in this order.

### 5.1 Duplicate content slides

For each content section in the plan, duplicate `p3`:

```json
{"duplicateObject": {"objectId": "p3"}}
```

If the deck has an ANEXO section, also duplicate `p5`:

```json
{"duplicateObject": {"objectId": "p5"}}
```

Each duplication returns a new slide objectId; capture them from the response's `replies[].duplicateObject.objectId`.

### 5.2 Reorder slides

After all duplications, use `updateSlidesPosition` to place duplicates in the final order. Target sequence:

```
[p1, p2, <dup-for-section-1>, <dup-for-section-2>, …, <dup-p5-anexo>?, <dup-p3-annex-1>?, p6]
```

```json
{
  "updateSlidesPosition": {
    "slideObjectIds": ["NEW_CONTENT_1", "NEW_CONTENT_2", "..."],
    "insertionIndex": 2
  }
}
```

### 5.3 Delete unused template originals

Delete `p3`, `p4` (the two source content template slides), and `p5` (if not used as ANEXO divider) — these are just starting-point duplicates:

```json
{"deleteObject": {"objectId": "p3"}}
{"deleteObject": {"objectId": "p4"}}
```

**Never** delete `p1`, `p2`, or `p6`. They are kept in place.

**Critical ordering:** Duplications first, then reorder, then deletions. All can go in one batchUpdate if ordered correctly.

Execute:
```bash
CI=true gws slides presentations batchUpdate \
  --params '{"presentationId": "PRES_ID"}' \
  --json '{"requests": [...]}'
```

---

## Step 6: Re-read Presentation

After structural mutations, re-read to get fresh, authoritative objectIds:

```bash
CI=true gws slides presentations get --params '{"presentationId": "PRES_ID"}'
```

For each duplicated content slide, identify its elements by position (title at `y ≈ 16`, body at `y ≈ 87`, group at `(0, 0)`) and/or by the preserved template text (`Introducción`, `OBJETIVO`, `01`). Cache:

```
{
  slide_index: {
    slide_id: "...",
    title_id: "...",       // the "Introducción" text box (from p3_i17)
    body_id: "...",        // the OBJETIVO/ANTECEDENTES rectangle (from p3_i7)
    group_id: "...",       // the numeral group (from p3_i4)
    numeral_text_id: "..." // the "01" inside the group (from p3_i3)
  }
}
```

---

## Step 7: Generate SVG Assets (Parallel Subagents) — Optional

Skip this step entirely if no visuals are planned.

### 7.1 Setup

```bash
mkdir -p ./slide_assets
```

### 7.2 Spawn subagents

For every slide that needs an image, spawn a subagent **in parallel**. Each subagent receives:

1. The SVG generation guidelines (from `references/svg-generation-guide.md`)
2. The specific content/topic for this image
3. The SVG category (A, B, C, or D)
4. The target dimensions (2× PT of the insertion size — see `references/template-structure.md` § Image Insertion Reference)
5. The output file path: `./slide_assets/slide_N_img_M.svg`

Use the subagent prompt template from `references/svg-generation-guide.md`.

**If using Pillow fallback** (no SVG converter detected in Step 0.2): Modify the subagent prompt to generate PNGs directly using Pillow instead of SVGs. See `references/image-pipeline.md` Option 4.

---

## Step 8: Convert SVGs to PNG

Using the converter detected in Step 0.2, convert each SVG to PNG. See `references/image-pipeline.md` Step 3 for the specific command per converter.

Generate at the SVG's native viewBox dimensions (already 2× for retina).

If conversion fails for any image, try the next converter in the priority chain. If all fail, fall back to Pillow direct generation.

---

## Step 9: Upload PNGs and Insert Images

### 9.1 Upload each PNG to Drive

```bash
CI=true gws drive files create \
  --upload ./slide_assets/slide_N_img_M.png \
  --json '{"name": "slide_N_img_M.png", "mimeType": "image/png"}' \
  --params '{"uploadType": "multipart"}'
```

### 9.2 Set public permission

```bash
CI=true gws drive permissions create \
  --params '{"fileId": "UPLOADED_FILE_ID"}' \
  --json '{"role": "reader", "type": "anyone"}'
```

### 9.3 Resize / delete body box and insert image

If the visual replaces (rather than supplements) the body text, delete the body rectangle first:

```json
{"deleteObject": {"objectId": "BODY_BOX_ID"}}
```

Then insert the image. The Sermas template has no predefined image slots, so choose coordinates from `references/template-structure.md` § Image Insertion Reference based on the slide's layout intent.

```json
{
  "createImage": {
    "url": "https://drive.google.com/uc?export=download&id=UPLOADED_FILE_ID",
    "elementProperties": {
      "pageObjectId": "SLIDE_OBJECT_ID",
      "size": {
        "width": {"magnitude": WIDTH_PT, "unit": "PT"},
        "height": {"magnitude": HEIGHT_PT, "unit": "PT"}
      },
      "transform": {
        "scaleX": 1, "scaleY": 1,
        "translateX": X_PT, "translateY": Y_PT,
        "unit": "PT"
      }
    }
  }
}
```

**Safe insertion coordinates** (avoid logo and footer):

| Use case | x (PT) | y (PT) | w (PT) | h (PT) |
|----------|--------|--------|--------|--------|
| Right-half supporting visual | 500 | 150 | 420 | 330 |
| Centered hero diagram below title | 120 | 120 | 720 | 380 |
| Full-width data chart | 40 | 120 | 880 | 380 |

---

## Step 9b: Visual Verification of Images (MANDATORY when images used)

After all images are inserted, **verify every slide with images visually**. SVG generation is error-prone; issues like clipping, overlap with the logo, or visible box outlines are only detectable visually.

### 9b.1 Get slide thumbnails

For each slide that contains generated images:

```bash
CI=true gws slides presentations pages getThumbnail \
  --params '{"presentationId": "PRES_ID", "pageObjectId": "SLIDE_OBJECT_ID", "thumbnailProperties.thumbnailSize": "LARGE"}'
```

### 9b.2 Download and inspect visually

```bash
curl -sL "THUMBNAIL_CONTENT_URL" -o /tmp/slide_N_thumb.png
```

Then use the Read tool on the downloaded PNG file to visually inspect it.

### 9b.3 Verify checklist

For each slide, confirm:
- **No clipping** — all image content fits within the slide, nothing cut off
- **No visible box outline** — white SVG background blends with the white slide
- **No overlap** — the image does not intrude on the Comunidad de Madrid logo (top-right) or the "Página" footer (bottom-left)
- **Text in image is readable** — labels, numbers, etc. are legible
- **Quality is acceptable** — not blurry, pixelated, or distorted

### 9b.4 Regenerate if needed

If any issue is found, fix the SVG (padding, background, layout), reconvert, re-upload, re-insert, and **re-verify**. See `references/image-pipeline.md` Step 8 for detailed recovery procedures.

---

## Step 10: Fill Text Content

For each slide, replace placeholder text with generated content. Use `deleteText` + `insertText` on specific objectIds (the safer strategy for this template).

**CRITICAL — style reset is mandatory.** `deleteText` does NOT guarantee that the next `insertText` inherits the placeholder's canonical style. After `deleteText` + `insertText`, the inserted text may pick up an arbitrary leftover style from the element's existing runs. **Always follow the insert with an `updateTextStyle` call that asserts the canonical style for that element role** (see §10.x Canonical Styles below). Skipping this step produces visibly inconsistent decks.

### Cover slide (`p1`)

```json
{"deleteText": {"objectId": "p1_i18", "textRange": {"type": "ALL"}}},
{"insertText": {"objectId": "p1_i18", "insertionIndex": 0, "text": "<Project Name>: Lanzamiento del proyecto"}},
{"deleteText": {"objectId": "p1_i19", "textRange": {"type": "ALL"}}},
{"insertText": {"objectId": "p1_i19", "insertionIndex": 0, "text": "En Madrid, a 13 de abril de 2026"}}
```

The cover placeholders usually survive `insertText` without style drift, but still verify visually in Step 9b/13 and reset if needed.

### TOC slide (`p2`) — handled in Step 11

### Content slides (duplicates of `p3`)

For each content slide, using the cached objectIds from Step 6:

```json
// Numeral (inside group)
{"deleteText": {"objectId": "NUMERAL_TEXT_ID", "textRange": {"type": "ALL"}}},
{"insertText": {"objectId": "NUMERAL_TEXT_ID", "insertionIndex": 0, "text": "02"}},

// Section title
{"deleteText": {"objectId": "TITLE_ID", "textRange": {"type": "ALL"}}},
{"insertText": {"objectId": "TITLE_ID", "insertionIndex": 0, "text": "Alcance del proyecto"}},

// Body content
{"deleteText": {"objectId": "BODY_ID", "textRange": {"type": "ALL"}}},
{"insertText": {"objectId": "BODY_ID", "insertionIndex": 0, "text": "Primer punto clave del alcance.\nSegundo punto clave.\nTercer punto."}}
```

**Body text does NOT keep bullets** after `deleteText`+`insertText`. The template's bullet list style lives on the deleted paragraphs — once gone, newline-separated lines render as plain paragraphs in Calibri. If you want bullets, add a `createParagraphBullets` call with `bulletPreset: "BULLET_DISC_CIRCLE_SQUARE"` scoped to the body range after the insert; otherwise plan the body as free text.

### §10.x Canonical Styles (apply after every `insertText`)

Right after the `deleteText` + `insertText` pair for each role, append a `updateTextStyle` request with the exact canonical style below. Batch them with the text inserts — one style reset per role per slide.

**Numeral** (inside the `p3_i4`-derived group, e.g. `NUMERAL_TEXT_ID`):

```json
{"updateTextStyle": {
  "objectId": "NUMERAL_TEXT_ID",
  "textRange": {"type": "ALL"},
  "style": {
    "bold": true,
    "fontFamily": "Calibri",
    "fontSize": {"magnitude": 66, "unit": "PT"},
    "foregroundColor": {"opaqueColor": {"rgbColor": {"red": 0.18431373, "green": 0.33333334, "blue": 0.5921569}}},
    "italic": false,
    "weightedFontFamily": {"fontFamily": "Calibri", "weight": 700}
  },
  "fields": "bold,fontFamily,fontSize,foregroundColor,italic,weightedFontFamily"
}}
```

**Section title** (`*_i17` role — was `Introducción`):

```json
{"updateTextStyle": {
  "objectId": "TITLE_ID",
  "textRange": {"type": "ALL"},
  "style": {
    "bold": false,
    "fontFamily": "Calibri",
    "fontSize": {"magnitude": 24, "unit": "PT"},
    "foregroundColor": {"opaqueColor": {"rgbColor": {"red": 0.4, "green": 0.4, "blue": 0.4}}},
    "italic": false,
    "weightedFontFamily": {"fontFamily": "Calibri", "weight": 400}
  },
  "fields": "bold,fontFamily,fontSize,foregroundColor,italic,weightedFontFamily"
}}
```

Gray `rgb(0.4, 0.4, 0.4)` = `#666666`. Never leave a content title in red — that's a leftover run from the placeholder, not the Sermas brand.

**Body** (`*_i7` role — was `<Incluir en esta sección…>` + `OBJETIVO` + `ANTECEDENTES`):

```json
{"updateTextStyle": {
  "objectId": "BODY_ID",
  "textRange": {"type": "ALL"},
  "style": {
    "bold": false,
    "fontFamily": "Calibri",
    "fontSize": {"magnitude": 16, "unit": "PT"},
    "foregroundColor": {"opaqueColor": {"themeColor": "DARK1"}},
    "italic": false,
    "weightedFontFamily": {"fontFamily": "Calibri", "weight": 400}
  },
  "fields": "bold,fontFamily,fontSize,foregroundColor,italic,weightedFontFamily"
}}
```

Body size can be 14–18 PT depending on density; 16 PT is a good default for Sermas bullet-count content.

### ANEXO divider (duplicate of `p5`)

If present, replace the `ANEXO` title text with the chosen divider label (or keep as "ANEXO" for a classic annex separator).

### Closing slide (`p6`)

**Do NOT modify.** The "GRACIAS" text, stethoscope image, and decorative elements stay as-is. Skip this slide entirely in Step 10.

### Speaker notes (if requested)

For each slide, find the notes page BODY element via `slides[N].slideProperties.notesPage.pageElements` and insert text:

```json
{"insertText": {"objectId": "NOTES_BODY_ELEMENT_ID", "insertionIndex": 0, "text": "Speaker notes content..."}}
```

Speaker notes carry the detailed prose; slide text stays concise.

### Batch sizing

Keep batchUpdate requests under ~20 operations per call. Process text for a few slides per batch.

---

## Step 11: Update the Table of Contents (INDICE)

Slide `p2` is a fixed 8-section grid. Fill the section title boxes with the user's sections; delete unused slots.

### 11.1 Map sections to TOC title boxes

Section title objectIds are fixed on `p2`:

| Section # | Title box objectId |
|-----------|--------------------|
| 01 | `p2_i6` |
| 02 | `p2_i9` |
| 03 | `p2_i11` |
| 04 | `p2_i14` |
| 05 | `p2_i20` |
| 06 | `p2_i3` |
| 07 | `p2_i38` |
| 08 | `p2_i39` |

### 11.2 Replace each used section's title

For each section in the deck:

```json
{"deleteText": {"objectId": "p2_i6", "textRange": {"type": "ALL"}}},
{"insertText": {"objectId": "p2_i6", "insertionIndex": 0, "text": "Section 1 title"}},
{"updateTextStyle": {
  "objectId": "p2_i6",
  "textRange": {"type": "ALL"},
  "style": {
    "bold": false,
    "fontFamily": "Calibri",
    "fontSize": {"magnitude": 22, "unit": "PT"},
    "foregroundColor": {"opaqueColor": {"rgbColor": {"red": 0.34901962, "green": 0.34901962, "blue": 0.34901962}}},
    "italic": false,
    "weightedFontFamily": {"fontFamily": "Calibri", "weight": 400}
  },
  "fields": "bold,fontFamily,fontSize,foregroundColor,italic,weightedFontFamily"
}}
```

**MANDATORY style reset.** The 8 TOC slot placeholders do not all ship with the same run style: slot 1 and 2 present as Calibri 22pt gray, but slots 3–8 have accumulated per-slot drift (different fonts/weights/colors) that persists through `insertText`. Without the `updateTextStyle` above, slot 2 typically renders in blue, slot 3 onward in a sans-serif not matching the rest, and the index looks inconsistent. Issue the canonical `updateTextStyle` for every populated slot. Gray target is `rgb(0.349, 0.349, 0.349)` = `#595959`, Calibri 22 PT, not bold, not italic.

### 11.3 Delete unused slots

For each slot beyond the user's section count, delete the number box, title box, and underline line. Example — to remove slot 07:

```json
{"deleteObject": {"objectId": "p2_i32"}},  // "07" numeral
{"deleteObject": {"objectId": "p2_i38"}},  // title
{"deleteObject": {"objectId": "p2_i36"}}   // underline line
```

Full unused-slot mappings (from `references/template-structure.md`):

| Slot | Numeral | Title | Underline |
|------|---------|-------|-----------|
| 01 | `p2_i8` | `p2_i6` | `p2_i15` |
| 02 | `p2_i10` | `p2_i9` | `p2_i16` |
| 03 | `p2_i12` | `p2_i11` | `p2_i25` |
| 04 | `p2_i18` | `p2_i14` | `p2_i24` |
| 05 | `p2_i30` | `p2_i20` | `p2_i33` |
| 06 | `p2_i31` | `p2_i3` | `p2_i34` |
| 07 | `p2_i32` | `p2_i38` | `p2_i37` |
| 08 | `p2_i35` | `p2_i39` | `p2_i36` |

Delete in one `batchUpdate` for all unused slots.

---

## Step 12: Cleanup

### 12.1 Delete temporary images from Drive (if any)

```bash
CI=true gws drive files delete --params '{"fileId": "UPLOADED_FILE_ID_1"}'
# ... for each uploaded image
```

### 12.2 Delete local assets

```bash
rm -rf ./slide_assets/
```

Non-critical failures here (404 on delete) can be logged and ignored.

---

## Step 13: Return Result

### 13.1 Get presentation URL

```bash
CI=true gws drive files get --params '{"fileId": "PRES_ID", "fields": "id,name,webViewLink"}'
```

### 13.2 Present to user

Display the following **as text in the chat message** (not just in tool output):

- The presentation URL (`webViewLink`)
- Summary: title, number of slides (cover + TOC + N content + optional ANEXO + closing), visuals generated (if any)
- Remind the user to review and adjust — especially the date on the cover, TOC section titles, and any content that required judgment calls

**IMPORTANT:** Always show the URL as plain text in the chat message so the user can see and click it.

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `gws` not found | CLI not installed | Tell user: "Ask me to 'Set up BinPar tools'" |
| 401 Unauthorized | Token expired | Run `CI=true gws auth login`, show URL in chat |
| Template not accessible | Sharing permissions | Verify template ID `1shVwhiGRIgLml3TB9SUMsEW_OwS0HHDsuH2bb3MMaVc` is shared with the user |
| `batchUpdate` fails | Invalid objectId | Re-read presentation (Step 6) for fresh IDs, rebuild requests, retry |
| More than 8 sections requested | TOC can't grow | Ask user to merge/drop sections until ≤ 8 |
| User asks for contact slide | Not in Sermas template | Tell the user this template has no contact card; it ends with "GRACIAS" |
| User asks for two-column / big-number / cards layout | Not in Sermas template | Tell the user Sermas is single-column text layout; offer to break content across multiple slides instead |
| SVG generation fails | Subagent error | Re-spawn subagent with simpler instructions |
| SVG conversion fails | No converter available | Try next in chain: cairosvg → inkscape → chrome → pillow |
| Image upload fails | Drive quota/permissions | Retry once; check auth status |
| `createImage` returns 400 | URL not publicly accessible | Verify permission was set in Step 9.2 |
| Numeral "01" disappears on content slide | `insertText` lost the 66 PT bold style from the placeholder | Apply the Numeral canonical `updateTextStyle` from §10.x — Calibri 66 PT bold, `rgb(0.184, 0.333, 0.592)` |
| Section title renders red instead of gray | Leftover run color from placeholder survived `insertText` | Apply the Section title canonical `updateTextStyle` from §10.x — Calibri 24 PT, `rgb(0.4, 0.4, 0.4)` |
| Body renders italic | Italic run survived `deleteText` | Apply the Body canonical `updateTextStyle` — `italic: false`, Calibri 16 PT |
| TOC slot 3+ uses a different font than slots 1–2 | Per-slot style drift in the template placeholders | Apply the TOC canonical `updateTextStyle` from Step 11.2 to every populated slot |
| `createImage` invalid image | Corrupt PNG | Reconvert from SVG or regenerate |
| Rate limit (429) | API quota exceeded | Wait 2-5 seconds, retry the failed call |
| Large batch timeout | Too many operations | Split batchUpdate into smaller batches (~20 requests) |
| Closing slide looks wrong | Accidentally modified | Re-duplicate `p6` from the master template and restore |
| Logo appears displaced on content slide | Logo was deleted or moved | The logo is in layout `p9` — recreating the slide from the layout restores it; do not manually reinsert |
| Cleanup delete fails | File already deleted | Non-critical — log and continue |

If a `batchUpdate` fails, always re-read the presentation structure before retrying — objectIds may have changed.
