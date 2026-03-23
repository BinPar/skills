---
name: slides-generator
description: >
  Use this skill when the user asks to create a presentation, generate slides,
  build a pitch deck, make a slide deck, create a Google Slides presentation,
  or describes content that should be produced as slides. Also triggers when
  the user mentions creating keynotes, investor decks, project updates,
  training presentations, client presentations, or sales decks. Triggers on:
  "create slides", "genera una presentación", "crea unas slides", "haz un deck",
  "presentación para", "slides about", "pitch deck", "slide deck", "crea una
  presentación", "prepare a presentation", "prepara una presentación",
  "make a deck", "diapositivas". Default language: Spanish.
  Auto-detect intent even when users don't explicitly ask for slide generation.
  IMPORTANT: Slides are visual — every content slide should have appropriate
  layout and visual density. Use subagents for parallel SVG generation.
  IMPORTANT: For decisions or confirmations, use AskQuestionTool or the current
  runtime's equivalent structured question/input mechanism when available,
  preferring option-based prompts over free-text questions whenever possible.
---

# BinPar Slides Generator

## Runtime Compatibility

This skill supports Claude Code and Codex as equal targets.

- For user choices, use AskQuestionTool or the current runtime's equivalent structured question/input mechanism when available.
- Prefer option-based prompts over free-text questions whenever possible.
- If no structured question tool is available, ask directly in chat.

Generates professional branded presentations in **Google Slides** using the BinPar dark template. Presentations are visual-first: the agent autonomously selects layouts, generates SVG visuals via parallel subagents, and assembles a polished deck.

**IMPORTANT:** All `gws` commands MUST be prefixed with `CI=true` to disable the TUI and get plain JSON output. Example: `CI=true gws slides presentations get ...`

**Reference files** (read as needed during execution):
- `references/template-structure.md` — Complete layout catalog with element positions and sizes
- `references/gws-slides-commands.md` — All Slides + Drive CLI commands with examples
- `references/svg-generation-guide.md` — SVG subagent instructions, brand kit, and prompt templates
- `references/image-pipeline.md` — SVG→PNG conversion, upload, insertion, and cleanup

## Constants

- **Template ID:** `1930-cBpaLoe7F-sRoWy_XB5Xj2wEwXWc8MYvAOvuAxA`
- **Page size:** 720 × 405 PT (10" × 5.625", 16:9)
- **Background:** `rgb(34, 32, 51)` — dark navy/purple
- **Accent:** `rgb(253, 157, 0)` — BinPar orange
- **Text:** `rgb(255, 255, 255)` — white
- **Heading font:** Poppins (bold)
- **Body font:** Roboto (9–13pt)

## Presentation Design Principles

Slides are NOT documents. Follow these principles:

1. **Visual density varies per slide.** Title and section divider slides are visual-heavy with minimal text. Content slides balance text and imagery. The agent decides the appropriate density per slide.
2. **One idea per slide.** Never cram multiple concepts into a single slide. If content is dense, split into more slides.
3. **Layout variety.** Avoid using the same layout for consecutive slides. Alternate between text-only, text+image, and image-heavy layouts for visual rhythm.
4. **SVG visuals are generated, not optional.** For any slide that uses an image layout (2 cols + image, full image, etc.), the agent MUST generate SVG visuals using subagents. These can be content diagrams, data visualizations, concept illustrations, or timelines depending on context.
5. **Keep text concise.** Slides are not prose. Use short phrases, bullet points, and keywords. Save detailed explanations for speaker notes (if requested).

---

## Step 0: Prerequisites

### 0.1 Verify gws is installed and authenticated

```bash
CI=true gws drive files list --params '{"pageSize": 1}'
```

- If `gws` is not found → tell the user: "Ask me to 'Set up BinPar tools' to install and configure it." Then stop.
- If auth is expired → run `CI=true gws auth login`, extract the URL from the output, and display it as text in the chat so the user can click it.

### 0.2 Detect SVG converter

Check which SVG→PNG converter is available (run once, remember the result):

```bash
python3 -c "import cairosvg; print('cairosvg')" 2>/dev/null \
  || (which inkscape 2>/dev/null && echo 'inkscape') \
  || (ls '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' 2>/dev/null && echo 'chrome') \
  || echo 'pillow-fallback'
```

Store the result. If `pillow-fallback`, subagents will generate PNGs directly with Pillow instead of SVGs. See `references/image-pipeline.md` for conversion commands per tool.

---

## Step 1: Gather Requirements

Parse the user's request to extract:

| Field | Required | How to infer | If not inferable |
|-------|----------|-------------|-----------------|
| Topic / title | Yes | From conversation | AskQuestionTool |
| Key content points | Yes | Listed in request | AskQuestionTool if none provided |
| Language | Yes | User's language | Default Spanish |
| Audience | No | Context clues | Infer "general" |
| Contact person | Yes | **Never assume** | **Always ask** — name, role, phone, email |
| Speaker notes | No | Default: no | Ask once via AskQuestionTool |
| Destination folder | Yes | URL or name in request | AskQuestionTool |

**Rules:**
- Always ask who the contact person should be (name, role, phone number, email). This information is required for the Contact slide.
- Ask once whether the user wants speaker notes generated.
- Infer reasonable defaults for everything else. Only ask for clarification if critical information is genuinely ambiguous.
- If the user provides a folder URL, extract the folder ID: `https://drive.google.com/drive/folders/{FOLDER_ID}`
- If they provide a folder name, search for it:
  ```bash
  CI=true gws drive files list --params '{"q": "name = '\''Folder Name'\'' and mimeType = '\''application/vnd.google-apps.folder'\''", "pageSize": 5}'
  ```

---

## Step 2: Plan the Deck (Autonomous)

Based on the gathered requirements, plan the complete slide deck. This is done autonomously — do not ask the user to approve the slide plan. Use your judgment to create a well-structured, professional presentation.

### 2.1 Determine slide count

Typical range: 8–16 slides. Base the count on:
- Amount of content to cover
- Audience (investor decks are shorter, training decks longer)
- One idea per slide rule

### 2.2 Map content to slide sequence

Every deck has this fixed structure:

| Position | Slide | Layout | Notes |
|----------|-------|--------|-------|
| First | Title / Cover | TITLE (template slide 1) | Always present |
| Second | Table of Contents | BLANK custom (template slide 2) | Always present, auto-generated last |
| Middle | Content slides | Varies per slide | 4–12 content slides typically |
| Penultimate | Contact | Contact custom (template slide 13) | Always present |
| Last | Closing | BLANK custom (template slide 14) | Always present — do not modify |

### 2.3 Select layouts for content slides

For each content slide, select from the layout catalog based on content type:

| Content Type | Recommended Layout | Template Slide # | Images Needed |
|---|---|---|---|
| Section divider / transition | SECTION_HEADER | Use `createSlide` with layout `p3` | 0 |
| Text explanation with optional quote | Plain Text + Quote | 3 | 0 |
| Two parallel topics | Two Columns | 4 | 0 |
| Four short concepts (2×2 grid) | Four Blocks | 5 | 0 |
| Content + single supporting visual | 2 Cols + Image | 6 | 1 |
| Two concepts + two supporting visuals | 2 Blocks + Images | 7 | 2 |
| Three-image showcase | 3 Img Composition | 8 | 3 |
| Full visual emphasis | Full Image | 9 | 1 |
| Feature list / steps / highlights | Special List | 10 | 0 |
| Card comparison / team / tiers | Cards Group | 11 | 0 |
| Concept definitions / glossary | Table of Concepts | 12 | 0 |
| Key metric or number | BIG_NUMBER | Use `createSlide` with layout `p11` | 0 |
| Key statement | MAIN_POINT | Use `createSlide` with layout `p8` | 0 |

**Layout variety rule:** Do not use the same layout for two consecutive content slides. Alternate between text-only and visual layouts.

### 2.4 Plan visuals

For each slide that uses an image layout, decide what SVG to generate:
- **Content diagram** (Category A) — flowcharts, architecture, process diagrams
- **Data visualization** (Category B) — bar charts, comparisons, metrics
- **Concept illustration** (Category C) — abstract/decorative visuals, icons
- **Timeline / process** (Category D) — step sequences, project phases

See `references/svg-generation-guide.md` for category details and prompt templates.

### 2.5 Internal plan structure

Build an internal plan (not shown to user) mapping each slide to:
- Position in sequence (1-indexed)
- Template slide to duplicate (or layout to create from)
- Content outline (title, subtitle, body text, etc.)
- Image needs (category, topic, dimensions)

---

## Step 3: Copy Template

```bash
CI=true gws drive files copy \
  --params '{"fileId": "1930-cBpaLoe7F-sRoWy_XB5Xj2wEwXWc8MYvAOvuAxA"}' \
  --json '{"name": "PRESENTATION_TITLE", "parents": ["FOLDER_ID"]}'
```

Extract the new presentation `id` from the response. If the user doesn't care about the folder, omit `parents`.

---

## Step 4: Read Presentation Structure

```bash
CI=true gws slides presentations get --params '{"presentationId": "NEW_PRES_ID"}'
```

Parse the response to build a map of:
- All 14 slide objectIds
- All element objectIds per slide (text boxes, shapes, images, groups)
- Layout references for each slide (`slideProperties.layoutObjectId`)
- Notes page element IDs (if speaker notes are requested)

Cross-reference with `references/template-structure.md` to identify each element's role (title, subtitle, body, image, etc.) by matching objectIds.

---

## Step 5: Structural Mutations

Build a single `batchUpdate` with three types of operations, in this order:

### 5.1 Duplicate needed template slides

For each content slide in the plan that uses a template slide (slides 1–14), issue a `duplicateObject` request:

```json
{"duplicateObject": {"objectId": "TEMPLATE_SLIDE_OBJECT_ID"}}
```

For slides using master layouts not in the template (SECTION_HEADER, BIG_NUMBER, MAIN_POINT), use `createSlide`:

```json
{"createSlide": {"slideLayoutReference": {"predefinedLayout": "SECTION_HEADER"}}}
```

### 5.2 Reorder duplicated slides

After all duplications, use `updateSlidesPosition` to arrange slides in the planned order:

```json
{
  "updateSlidesPosition": {
    "slideObjectIds": ["NEW_SLIDE_1", "NEW_SLIDE_2", "..."],
    "insertionIndex": 0
  }
}
```

### 5.3 Delete original template slides

Delete all 14 original template slides:

```json
{"deleteObject": {"objectId": "ORIGINAL_SLIDE_1"}},
{"deleteObject": {"objectId": "ORIGINAL_SLIDE_2"}},
...
```

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

Build a new map of slide objectIds and their elements. The duplicated slides have system-generated IDs — identify elements by their placeholder type (`TITLE`, `SUBTITLE`, `BODY`), shape type, or position to match them to your content plan.

---

## Step 7: Generate SVG Assets (Parallel Subagents)

### 7.1 Setup

```bash
mkdir -p ./slide_assets
```

### 7.2 Spawn subagents

For every slide that needs an image, spawn a subagent **in parallel** (no cap on concurrency). Each subagent receives:

1. The SVG generation guidelines (from `references/svg-generation-guide.md`)
2. The specific content/topic for this image
3. The SVG category (A, B, C, or D)
4. The exact dimensions (from the layout's image position in `references/template-structure.md`, multiplied by 2 for retina)
5. The output file path: `./slide_assets/slide_N_img_M.svg`

Use the subagent prompt template from `references/svg-generation-guide.md`.

**If using Pillow fallback** (no SVG converter detected in Step 0.2): Modify the subagent prompt to generate PNGs directly using Pillow instead of SVGs. See `references/image-pipeline.md` Option 4.

### 7.3 Pre-calculated dimensions per layout

| Layout | Image Slot | SVG viewBox (2x retina) |
|--------|-----------|------------------------|
| 2 Cols + Image | 1 | 612 × 560 |
| 2 Blocks + Images | 1 (left) | 230 × 210 |
| 2 Blocks + Images | 2 (right) | 230 × 210 |
| 3 Img Composition | 1 (left) | 402 × 460 |
| 3 Img Composition | 2 (center) | 402 × 460 |
| 3 Img Composition | 3 (right) | 402 × 460 |
| Full Image | 1 | 604 × 810 |

---

## Step 8: Convert SVGs to PNG

Using the converter detected in Step 0.2, convert each SVG to PNG. See `references/image-pipeline.md` Step 3 for the specific command per converter.

Generate at the SVG's native viewBox dimensions (already 2x for retina).

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

### 9.3 Delete template sample images and insert generated ones

Build a batchUpdate that:
1. Deletes the existing sample images on duplicated slides (by their objectId from Step 6)
2. Creates new images at the correct positions

```json
{"deleteObject": {"objectId": "EXISTING_SAMPLE_IMAGE_ID"}},
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

Use the exact position values from `references/template-structure.md` § Image Insertion Reference:

| Layout | Img | x PT | y PT | w PT | h PT |
|--------|-----|------|------|------|------|
| 2 Cols + Image | 1 | 382.0 | 95.6 | 306.2 | 280.0 |
| 2 Blocks + Images | 1 | 124.4 | 98.9 | 115.0 | 105.2 |
| 2 Blocks + Images | 2 | 480.5 | 98.9 | 115.0 | 105.2 |
| 3 Img Composition | 1 | 25.7 | 95.6 | 201.1 | 230.0 |
| 3 Img Composition | 2 | 259.9 | 95.6 | 201.1 | 230.0 |
| 3 Img Composition | 3 | 494.1 | 95.6 | 201.1 | 230.0 |
| Full Image | 1 | 418.0 | 0.0 | 302.0 | 405.0 |

---

## Step 9b: Visual Verification of Images (MANDATORY)

After all images are inserted, **you MUST verify every slide with images visually**. This is not optional — SVG generation is error-prone and issues like clipping, white borders, or cut-off content are only detectable visually.

### 9b.1 Get slide thumbnails

For each slide that contains generated images, get a rendered thumbnail:

```bash
CI=true gws slides presentations.pages getThumbnail \
  --params '{"presentationId": "PRES_ID", "pageObjectId": "SLIDE_OBJECT_ID", "thumbnailProperties.thumbnailSize": "LARGE"}'
```

### 9b.2 Download and inspect visually

```bash
curl -sL "THUMBNAIL_CONTENT_URL" -o /tmp/slide_N_thumb.png
```

Then **use the Read tool** on the downloaded PNG file to visually inspect it. The Read tool supports images and will show you the rendered slide.

### 9b.3 Verify checklist

For each slide, confirm:
- **No clipping** — all image content fits within the slide, nothing cut off at edges
- **No white borders** — image blends with dark background seamlessly
- **Correct position** — image is in the right slot without overlapping text
- **Text in image is readable** — labels, numbers, etc. are legible
- **Quality is acceptable** — not blurry, pixelated, or distorted

### 9b.4 Regenerate if needed

If any issue is found, regenerate the SVG with fixes (add padding for clipping, fix background for borders, simplify for quality), reconvert, re-upload, re-insert, and **re-verify**.

See `references/image-pipeline.md` Step 8 for detailed recovery procedures per issue type.

---

## Step 10: Fill Text Content

For each slide, replace the template placeholder text with generated content. Use one of two strategies:

### Strategy A: deleteText + insertText (recommended for most cases)

For each text element on the slide:

```json
{"deleteText": {"objectId": "SHAPE_ID", "textRange": {"type": "ALL"}}},
{"insertText": {"objectId": "SHAPE_ID", "insertionIndex": 0, "text": "New content"}}
```

This clears all text and inserts new content. Text styling is inherited from the template layout.

### Strategy B: replaceAllText (for simple placeholder replacement)

When a slide has unique placeholder text:

```json
{
  "replaceAllText": {
    "containsText": {"text": "PLACEHOLDER", "matchCase": true},
    "replaceText": "Actual content",
    "pageObjectIds": ["SLIDE_OBJECT_ID"]
  }
}
```

**Always scope with `pageObjectIds`** to avoid replacing text on other slides.

### Element roles across layouts

Most layouts follow this pattern (element roles from `references/template-structure.md`):

| Placeholder Type | Role | Content Guidelines |
|-----------------|------|-------------------|
| SUBTITLE (top, ~y=22pt) | Section label | Short category label, 2-4 words |
| TITLE (~y=39pt) | Slide heading | Clear, concise title, max 8 words |
| BODY (upper area) | Intro or full-width text | 1-2 sentences max |
| SUBTITLE (mid area) | Article/column title | Column heading, 3-6 words |
| BODY (lower/column area) | Column content | Bullet points or short paragraphs |

### Speaker notes (if requested)

For each slide, find the notes page BODY element:

From the presentation read, access `slides[N].slideProperties.notesPage.pageElements` and find the element with `placeholder.type = "BODY"`. Then:

```json
{"insertText": {"objectId": "NOTES_BODY_ELEMENT_ID", "insertionIndex": 0, "text": "Speaker notes content..."}}
```

Speaker notes should contain the detailed explanation behind the slide — the prose that would be in a document. Keep slide text concise and put depth in the notes.

### Special slides

**Contact slide:** Replace text in the contact card group children:
- Name element → contact person's name
- Role element → their role/title
- Phone element → phone number
- Email element → email address
- Title → "Contacto" or equivalent
- Body text → availability/closing message

**Closing slide:** Do NOT modify. The "GRACIAS" text, BinPar logo, and decorative elements stay as-is.

### Batch sizing

Keep batchUpdate requests under ~20 operations per call. Process all text operations for a few slides per batch.

---

## Step 11: Generate Table of Contents

The TOC must be generated LAST, after all other slides have their final titles.

### 11.1 Re-read the presentation

```bash
CI=true gws slides presentations get --params '{"presentationId": "PRES_ID"}'
```

### 11.2 Extract slide titles

For each slide (excluding Title, TOC, Contact, and Closing), find the TITLE placeholder element and extract its text content.

### 11.3 Format TOC entries

```
●  First Section Title ........................................ pág. 3
●  Second Section Title ........................................ pág. 4
●  Third Section Title ........................................ pág. 5
```

Pad with dots to align page numbers. Page numbers are 1-indexed slide positions.

### 11.4 Update TOC slide

Replace the TOC description text (second text box) with a brief description of the presentation:

```json
{"deleteText": {"objectId": "TOC_DESCRIPTION_ID", "textRange": {"type": "ALL"}}},
{"insertText": {"objectId": "TOC_DESCRIPTION_ID", "insertionIndex": 0, "text": "En las siguientes diapositivas encontrarás un desglose detallado de [presentation topic]."}}
```

Replace the index entries (third text box) with the generated TOC:

```json
{"deleteText": {"objectId": "TOC_INDEX_ID", "textRange": {"type": "ALL"}}},
{"insertText": {"objectId": "TOC_INDEX_ID", "insertionIndex": 0, "text": "●  Section Title ........................................ pág. 3\n●  Section Title ........................................ pág. 4"}}
```

---

## Step 12: Cleanup

### 12.1 Delete temporary images from Drive

```bash
CI=true gws drive files delete --params '{"fileId": "UPLOADED_FILE_ID_1"}'
CI=true gws drive files delete --params '{"fileId": "UPLOADED_FILE_ID_2"}'
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

- The presentation URL (webViewLink)
- Summary: title, number of slides, layouts used, number of visuals generated
- Remind the user to review and adjust as needed

**IMPORTANT:** Always show the URL as plain text in the chat message so the user can see and click it.

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `gws` not found | CLI not installed | Tell user: "Ask me to 'Set up BinPar tools'" |
| 401 Unauthorized | Token expired | Run `CI=true gws auth login`, show URL in chat |
| Template not accessible | Sharing permissions | Verify template ID `1930-cBpaLoe7F-sRoWy_XB5Xj2wEwXWc8MYvAOvuAxA` is shared |
| `batchUpdate` fails | Invalid objectId | Re-read presentation (Step 6) for fresh IDs, rebuild requests, retry |
| SVG generation fails | Subagent error | Re-spawn subagent with simpler instructions |
| SVG conversion fails | No converter available | Try next in chain: cairosvg → inkscape → chrome → pillow |
| Image upload fails | Drive quota/permissions | Retry once; check auth status |
| `createImage` returns 400 | URL not publicly accessible | Verify permission was set in Step 9.2 |
| `createImage` invalid image | Corrupt PNG | Reconvert from SVG or regenerate |
| Rate limit (429) | API quota exceeded | Wait 2-5 seconds, retry the failed call |
| Large batch timeout | Too many operations | Split batchUpdate into smaller batches (~20 requests) |
| Cleanup delete fails | File already deleted | Non-critical — log and continue |

If a `batchUpdate` fails, always re-read the presentation structure before retrying — objectIds and slide positions may have changed.
