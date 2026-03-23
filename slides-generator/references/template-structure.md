# Slides Template Structure Map

**Template Name:** BinPar Dark Presentation
**Template ID:** `1930-cBpaLoe7F-sRoWy_XB5Xj2wEwXWc8MYvAOvuAxA`
**Template URL:** https://docs.google.com/presentation/d/1930-cBpaLoe7F-sRoWy_XB5Xj2wEwXWc8MYvAOvuAxA/edit

> **Important:** The objectIds below are from the original template. After copying it and using `duplicateObject`, all objectIds change. The `duplicateObject` response contains `objectIdMappings` — you MUST parse and use the new IDs for all subsequent operations.

## Presentation Properties

| Property | Value |
|----------|-------|
| Page size | 720 × 405 PT (10" × 5.625", 16:9) |
| Master theme | bpDark (`simple-light-2`) |
| Background | `rgb(34, 32, 51)` — dark navy/purple |
| Primary accent | `rgb(253, 157, 0)` — BinPar orange |
| Text color | `rgb(255, 255, 255)` — white |
| Heading font | Poppins (bold) |
| Body font | Roboto (9–13pt) |

## Layout Catalog

The template contains 14 slides, each showcasing a different layout type. Use this as a **catalog**: for each slide in your presentation, pick the layout that best fits the content, duplicate that template slide, and fill in the content.

### Layout Selection Guide

| Content Type | Layout Name | Template Slide # | Has Images |
|---|---|---|---|
| Cover / title | TITLE | 1 | No |
| Table of contents | BLANK (custom) | 2 | No |
| Text explanation with optional quote | TITLE_AND_BODY | 3 | No |
| Two parallel topics / columns | TITLE_AND_TWO_COLUMNS | 4 | No |
| Four short concepts in grid | 4 Blocks (custom) | 5 | No |
| Text + single supporting visual | 2 Cols + Image (custom) | 6 | 1 image |
| Two concepts + two visuals | 2 Blocks + Images (custom) | 7 | 2 images |
| Three-image showcase | 3 Img Composition (custom) | 8 | 3 images |
| Full visual emphasis | Full Image (custom) | 9 | 1 large image |
| Feature / step list | Special List (custom) | 10 | No |
| Card-based comparison | Cards Group (custom) | 11 | No |
| Concept definitions / table | Table of Concepts (custom) | 12 | No |
| Contact information | Contact (custom) | 13 | No |
| Closing / thank you | BLANK (custom) | 14 | No |

Additional layouts available in the master (not used as template slides but can be created via `createSlide`):
- **SECTION_HEADER** (`p3`) — section divider
- **MAIN_POINT** (`p8`) — key statement
- **BIG_NUMBER** (`p11`) — single metric/number highlight

---

## Slide Details

### Slide 1: Title / Cover
- **ObjectId:** `p`
- **Layout:** TITLE (`p2`)
- **Use when:** First slide of every presentation

| Element ID | Type | Placeholder | Position (x,y) PT | Size (w,h) PT | Content |
|------------|------|-------------|-------------------|---------------|---------|
| `i0` | TEXT_BOX | CENTERED_TITLE | (21.2, 51.2) | (677.6, 131.6) | `MAIN TITLE` |
| `i1` | TEXT_BOX | SUBTITLE | (93.4, 169.7) | (533.1, 49.7) | `SUBTITULO DE LA PLANTILLA` |
| `g3b8ff82fc8d_0_112` | TEXT_BOX | SUBTITLE | (91.1, 234.7) | (537.7, 77.3) | `CLAIM DESCRIPTIVO DE LA PLANTILLA` |

**Text replacement strategy:** Use `deleteText` (type: ALL) + `insertText` on each element. The CENTERED_TITLE holds the main presentation title, first SUBTITLE holds a subtitle, second SUBTITLE holds a descriptive claim/tagline.

---

### Slide 2: Table of Contents
- **ObjectId:** `SLIDES_API2047196992_0`
- **Layout:** BLANK (`p12`)
- **Use when:** Always — second slide in every presentation

| Element ID | Type | Placeholder | Position (x,y) PT | Size (w,h) PT | Content | Style |
|------------|------|-------------|-------------------|---------------|---------|-------|
| `SLIDES_API1460497075_0` | TEXT_BOX | none | (40.0, 40.0) | (639.9, 60.0) | `Índice de contenidos` | Poppins 26pt bold white |
| `SLIDES_API1460497075_1` | TEXT_BOX | none | (40.0, 85.0) | (639.9, 60.0) | `En las siguientes diapositivas encontrarás un desglose detallado de [Descripción de la propuesta].` | Roboto 12pt white |
| `SLIDES_API1460497075_2` | TEXT_BOX | none | (40.0, 135.0) | (639.9, 400.0) | Index entries | Roboto 12pt bold orange |

**Text replacement strategy:**
1. Title (`SLIDES_API1460497075_0`): Keep as "Índice de contenidos" or translate.
2. Description (`SLIDES_API1460497075_1`): Replace `[Descripción de la propuesta]` with the actual presentation topic.
3. Index (`SLIDES_API1460497075_2`): Replace entirely with auto-generated entries after all slides are finalized. Format each entry as:
```
●  Section Title ........................................ pág. N
```

**Important:** Generate the TOC as the LAST step, after all other slides have their final titles.

---

### Slide 3: Plain Text with Quote
- **ObjectId:** `g3b904f9901d_3_10`
- **Layout:** TITLE_AND_BODY (`p4`)
- **Use when:** Text-heavy explanation with an optional highlighted quote

| Element ID | Type | Placeholder | Position (x,y) PT | Size (w,h) PT | Content |
|------------|------|-------------|-------------------|---------------|---------|
| `g3b904f9901d_3_16` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | (634.6, 31.0) | `Section Subtitle` |
| `g3b904f9901d_3_13` | TEXT_BOX | TITLE | (24.5, 39.5) | (670.9, 45.1) | `Main Section Title` |
| `g3bae3fc4825_0_1` | TEXT_BOX | SUBTITLE | (26.0, 85.1) | (491.9, 45.1) | `"Optional quote or highlighted text"` |
| `g3b904f9901d_3_14` | TEXT_BOX | BODY | (24.5, 135.0) | (670.9, 246.4) | Body text (lorem ipsum) |

**Element roles:** SUBTITLE at top = section label. TITLE = slide heading. Second SUBTITLE = optional quote (leave empty or delete if not needed). BODY = main text content.

---

### Slide 4: Two Columns
- **ObjectId:** `g3bae3fc4825_0_13`
- **Layout:** TITLE_AND_TWO_COLUMNS (`p5`)
- **Use when:** Two parallel topics or comparison

| Element ID | Type | Placeholder | Position (x,y) PT | Size (w,h) PT | Content |
|------------|------|-------------|-------------------|---------------|---------|
| `g3bae3fc4825_0_21` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | (634.6, 31.0) | `Section Subtitle` |
| `g3bae3fc4825_0_14` | TEXT_BOX | TITLE | (24.7, 39.4) | (670.9, 45.1) | `Main Section Title` |
| `g3bae3fc4825_0_28` | TEXT_BOX | BODY | (25.7, 83.7) | (670.9, 68.7) | Full-width intro text |
| `g3bae3fc4825_0_23` | TEXT_BOX | SUBTITLE | (24.4, 161.3) | (314.9, 39.0) | `Left Article Title` |
| `g3bae3fc4825_0_26` | TEXT_BOX | SUBTITLE | (380.5, 161.3) | (314.9, 39.0) | `Right Article Title` |
| `g3bae3fc4825_0_15` | TEXT_BOX | BODY | (24.5, 198.7) | (314.9, 177.7) | Left column body |
| `g3bae3fc4825_0_17` | TEXT_BOX | BODY | (380.5, 198.7) | (314.9, 177.7) | Right column body |

**Element roles:** Top area = section label + title + intro paragraph. Bottom area = two column blocks, each with its own article title and body.

---

### Slide 5: Four Blocks
- **ObjectId:** `g3bae3fc4825_0_99`
- **Layout:** Custom 4-block (`g3bae3fc4825_0_88`)
- **Use when:** Four short concepts in a 2×2 grid

| Element ID | Type | Placeholder | Position (x,y) PT | Size (w,h) PT | Content |
|------------|------|-------------|-------------------|---------------|---------|
| `g3bae3fc4825_0_103` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | (634.6, 31.0) | `Section Subtitle` |
| `g3bae3fc4825_0_100` | TEXT_BOX | TITLE | (24.7, 39.4) | (670.9, 45.1) | `Main Section Title` |
| `g3bae3fc4825_0_106` | TEXT_BOX | BODY | (25.7, 83.7) | (670.9, 68.7) | Full-width intro text |
| `g3bae3fc4825_0_104` | TEXT_BOX | SUBTITLE | (24.4, 161.3) | (314.9, 39.0) | Top-left article title |
| `g3bae3fc4825_0_105` | TEXT_BOX | SUBTITLE | (380.5, 161.3) | (314.9, 39.0) | Top-right article title |
| `g3bae3fc4825_0_101` | TEXT_BOX | BODY | (24.5, 198.7) | (314.9, 68.7) | Top-left body |
| `g3bae3fc4825_0_102` | TEXT_BOX | BODY | (380.5, 198.7) | (314.9, 68.7) | Top-right body |
| `g3bae3fc4825_0_115` | TEXT_BOX | SUBTITLE | (24.4, 267.2) | (314.9, 39.0) | Bottom-left article title |
| `g3bae3fc4825_0_116` | TEXT_BOX | SUBTITLE | (380.5, 267.2) | (314.9, 39.0) | Bottom-right article title |
| `g3bae3fc4825_0_113` | TEXT_BOX | BODY | (24.5, 304.6) | (314.9, 68.7) | Bottom-left body |
| `g3bae3fc4825_0_114` | TEXT_BOX | BODY | (380.5, 304.6) | (314.9, 68.7) | Bottom-right body |

**Element roles:** Same header pattern (subtitle + title + intro). Then a 2×2 grid of article title + body blocks.

---

### Slide 6: Two Columns + Image
- **ObjectId:** `g3bae3fc4825_0_183`
- **Layout:** Custom 2-col + image (`g3bae3fc4825_0_156`)
- **Use when:** Content with a single supporting visual

| Element ID | Type | Placeholder | Position (x,y) PT | Size (w,h) PT | Content |
|------------|------|-------------|-------------------|---------------|---------|
| `g3bae3fc4825_0_187` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | (608.2, 31.0) | `Section Subtitle` |
| `g3bae3fc4825_0_184` | TEXT_BOX | TITLE | (24.7, 39.4) | (670.7, 45.1) | `Main Section Title` |
| `g3bae3fc4825_0_190` | TEXT_BOX | BODY | (25.7, 83.7) | (314.9, 115.9) | Upper-left body text |
| `g3bae3fc4825_0_188` | TEXT_BOX | SUBTITLE | (24.4, 214.5) | (314.9, 39.0) | `Article title` |
| `g3bae3fc4825_0_185` | TEXT_BOX | BODY | (24.5, 251.9) | (314.9, 97.3) | Lower-left body text |
| `g3bae3fc4825_0_197` | IMAGE | — | (382.0, 95.6) | (306.2, 280.0) | *(image placeholder)* |

**Image insertion coordinates:**
```
Position: translateX=382.0, translateY=95.6 (PT)
Size: width=306.2, height=280.0 (PT)
```
After duplicating this slide, delete the existing template image, then use `createImage` with these coordinates to insert the generated visual.

---

### Slide 7: Two Blocks + Two Images
- **ObjectId:** `g3bae3fc4825_0_217`
- **Layout:** Custom 2-block + 2-image (`g3bae3fc4825_0_206`)
- **Use when:** Two concepts, each with a supporting visual

| Element ID | Type | Placeholder | Position (x,y) PT | Size (w,h) PT | Content |
|------------|------|-------------|-------------------|---------------|---------|
| `g3bae3fc4825_0_220` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | (608.2, 31.0) | `Section Subtitle` |
| `g3bae3fc4825_0_218` | TEXT_BOX | TITLE | (24.7, 39.4) | (670.7, 45.1) | `Main Section Title` |
| `g3bae3fc4825_0_223` | IMAGE | — | (124.4, 98.9) | (115.0, 105.2) | *(left image)* |
| `g3bae3fc4825_0_227` | IMAGE | — | (480.5, 98.9) | (115.0, 105.2) | *(right image)* |
| `g3bae3fc4825_0_221` | TEXT_BOX | SUBTITLE | (24.4, 215.5) | (314.9, 39.0) | `Left article title` |
| `g3bae3fc4825_0_222` | TEXT_BOX | SUBTITLE | (380.5, 215.5) | (314.9, 39.0) | `Right article title` |
| `g3bae3fc4825_0_219` | TEXT_BOX | BODY | (24.5, 251.9) | (314.9, 124.3) | Left body text |
| `g3bae3fc4825_0_226` | TEXT_BOX | BODY | (380.6, 251.9) | (314.9, 124.3) | Right body text |

**Image insertion coordinates:**

Image 1 (left):
```
Position: translateX=124.4, translateY=98.9 (PT)
Size: width=115.0, height=105.2 (PT)
```

Image 2 (right):
```
Position: translateX=480.5, translateY=98.9 (PT)
Size: width=115.0, height=105.2 (PT)
```

---

### Slide 8: Three Image Composition
- **ObjectId:** `g3bae3fc4825_0_459`
- **Layout:** Custom 3-image (`g3bae3fc4825_0_445`)
- **Use when:** Three-image showcase with short captions

| Element ID | Type | Placeholder | Position (x,y) PT | Size (w,h) PT | Content |
|------------|------|-------------|-------------------|---------------|---------|
| `g3bae3fc4825_0_462` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | (608.2, 31.0) | `Section Subtitle` |
| `g3bae3fc4825_0_460` | TEXT_BOX | TITLE | (24.7, 39.4) | (670.7, 45.1) | `Main Section Title` |
| `g3bae3fc4825_0_464` | IMAGE | — | (25.7, 95.6) | (201.1, 230.0) | *(left image)* |
| `g3bae3fc4825_0_470` | IMAGE | — | (259.9, 95.6) | (201.1, 230.0) | *(center image)* |
| `g3bae3fc4825_0_471` | IMAGE | — | (494.1, 95.6) | (201.1, 230.0) | *(right image)* |
| `g3bae3fc4825_0_461` | TEXT_BOX | BODY | (24.7, 340.7) | (201.1, 36.5) | Left caption |
| `g3bae3fc4825_0_465` | TEXT_BOX | BODY | (259.4, 340.7) | (201.1, 36.5) | Center caption |
| `g3bae3fc4825_0_466` | TEXT_BOX | BODY | (494.2, 340.7) | (201.1, 36.5) | Right caption |

**Image insertion coordinates:**

Image 1 (left):
```
Position: translateX=25.7, translateY=95.6 (PT)
Size: width=201.1, height=230.0 (PT)
```

Image 2 (center):
```
Position: translateX=259.9, translateY=95.6 (PT)
Size: width=201.1, height=230.0 (PT)
```

Image 3 (right):
```
Position: translateX=494.1, translateY=95.6 (PT)
Size: width=201.1, height=230.0 (PT)
```

---

### Slide 9: Full Image
- **ObjectId:** `g3bae3fc4825_0_419`
- **Layout:** Custom full image (`g3bae3fc4825_0_408`)
- **Use when:** Strong visual emphasis — the image fills the right half of the slide

| Element ID | Type | Placeholder | Position (x,y) PT | Size (w,h) PT | Content |
|------------|------|-------------|-------------------|---------------|---------|
| `g3bae3fc4825_0_422` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | (356.0, 31.0) | `Section Subtitle` |
| `g3bae3fc4825_0_420` | TEXT_BOX | TITLE | (24.7, 39.4) | (349.0, 45.1) | `Main Section Title` |
| `g3bae3fc4825_0_426` | TEXT_BOX | BODY | (25.7, 83.7) | (354.8, 115.9) | Upper body text |
| `g3bae3fc4825_0_423` | TEXT_BOX | SUBTITLE | (24.4, 214.5) | (356.0, 39.0) | `Article title` |
| `g3bae3fc4825_0_421` | TEXT_BOX | BODY | (24.5, 251.9) | (356.0, 115.9) | Lower body text |
| `g3bae3fc4825_0_424` | IMAGE | — | (418.0, 0.0) | (302.0, 405.0) | *(full-height image)* |

**Image insertion coordinates:**
```
Position: translateX=418.0, translateY=0.0 (PT)
Size: width=302.0, height=405.0 (PT)
```
Note: This image spans the full height of the slide (405 PT). Text content is constrained to the left ~55% of the slide.

---

### Slide 10: Special List
- **ObjectId:** `g3bae3fc4825_0_269`
- **Layout:** Custom (`g3bae3fc4825_0_259`)
- **Use when:** Feature list, numbered steps, or key highlights (4 items)

| Element ID | Type | Placeholder | Position (x,y) PT | Size (w,h) PT | Content |
|------------|------|-------------|-------------------|---------------|---------|
| `g3bae3fc4825_0_272` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | (634.6, 31.0) | `Section Subtitle` |
| `g3bae3fc4825_0_270` | TEXT_BOX | TITLE | (24.7, 39.4) | (670.9, 45.1) | `Main Section Title` |
| `g3bae3fc4825_0_273` | TEXT_BOX | BODY | (25.7, 83.7) | (670.9, 68.7) | Intro text |
| `g3bae3fc4825_0_285` | TEXT_BOX | none | (24.3, 159.0) | (632.3, 29.1) | `List Key:` — Poppins 12pt orange |
| `g3bae3fc4825_0_281` | ROUND_RECT | none | (26.8, 195.4) | (668.6, 36.4) | *(row 1 background)* |
| `g3bae3fc4825_0_286` | TEXT_BOX | none | (33.0, 199.9) | (650.6, 27.9) | Row 1 text — Roboto 11pt orange |
| `g3bae3fc4825_0_282` | ROUND_RECT | none | (26.8, 241.1) | (668.6, 36.4) | *(row 2 background)* |
| `g3bae3fc4825_0_287` | TEXT_BOX | none | (33.0, 244.4) | (650.6, 27.9) | Row 2 text — Roboto 11pt orange |
| `g3bae3fc4825_0_283` | ROUND_RECT | none | (26.8, 286.7) | (668.6, 36.4) | *(row 3 background)* |
| `g3bae3fc4825_0_288` | TEXT_BOX | none | (33.0, 290.4) | (650.6, 27.9) | Row 3 text — Roboto 11pt orange |
| `g3bae3fc4825_0_284` | ROUND_RECT | none | (26.8, 332.4) | (668.6, 36.4) | *(row 4 background)* |
| `g3bae3fc4825_0_289` | TEXT_BOX | none | (33.0, 337.1) | (650.6, 27.9) | Row 4 text — Roboto 11pt orange |

**Text replacement strategy:** Replace text in the 4 row text boxes. The `List Key:` label and ROUND_RECT backgrounds can stay or be updated. These are non-placeholder elements so use `deleteText` + `insertText` by objectId.

---

### Slide 11: Cards Group
- **ObjectId:** `g3bae3fc4825_0_290`
- **Layout:** Custom (`g3bae3fc4825_0_259`)
- **Use when:** Four-card comparison, team members, service tiers

Header elements (same as other custom layouts):

| Element ID | Type | Placeholder | Position (x,y) PT | Content |
|------------|------|-------------|-------------------|---------|
| `g3bae3fc4825_0_292` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | `Section Subtitle` |
| `g3bae3fc4825_0_291` | TEXT_BOX | TITLE | (24.7, 39.4) | `Main Section Title` |
| `g3bae3fc4825_0_293` | TEXT_BOX | BODY | (25.7, 83.7) | Intro text |

**Card groups (4 total):** Each card is a GROUP containing:

| Child | Type | Content | Style |
|-------|------|---------|-------|
| ROUND_RECTANGLE | Background | *(empty)* | Dark background |
| TEXT_BOX | Card title | `Main Card Title` | Roboto 11pt orange |
| TEXT_BOX | Card detail/badge | `Card Detail` | Roboto 11pt white |
| LINE | Separator | — | — |
| TEXT_BOX | Card description | `Lorem ipsum...` | Roboto 11pt black |

Card group IDs and positions:

| Card | Group ID | Approx position |
|------|----------|----------------|
| Top-left | `g3bae3fc4825_0_303` | Left, upper |
| Bottom-left | `g3bae3fc4825_0_327` | Left, lower |
| Top-right | `g3bae3fc4825_0_333` | Right, upper |
| Bottom-right | `g3bae3fc4825_0_339` | Right, lower |

**Text replacement strategy:** Access children within each group by their objectIds. Replace card title, detail, and description text in each card group.

---

### Slide 12: Table of Concepts
- **ObjectId:** `g3bae3fc4825_0_347`
- **Layout:** Custom + quote (`g3bae3fc4825_0_359`)
- **Use when:** Concept definitions, glossary, structured data table with header

| Element ID | Type | Placeholder | Position (x,y) PT | Content |
|------------|------|-------------|-------------------|---------|
| `g3bae3fc4825_0_349` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | `Section Subtitle` |
| `g3bae3fc4825_0_348` | TEXT_BOX | TITLE | (24.7, 39.4) | `Main Section Title` |
| `g3bae3fc4825_0_365` | TEXT_BOX | SUBTITLE | (26.0, 85.1) | `"Optional quote"` |

**Table group** (`g3bae3fc4825_0_399`, 8 children):

| Child ID | Type | Content | Role |
|----------|------|---------|------|
| `g3bae3fc4825_0_366` | ROUND_RECT | *(empty)* | Table background |
| `g3bae3fc4825_0_368` | TEXT_BOX | `Table of Concepts Title` | Table header — Roboto 13pt orange |
| `g3bae3fc4825_0_367` | TEXT_BOX | `Card Detail` | Header badge — Roboto 13pt black |
| `g3bae3fc4825_0_369` | LINE | — | Header separator |
| Row 1 text | TEXT_BOX | `Lorem ipsum...` | Roboto 11pt black |
| Row 2 text | TEXT_BOX | `Lorem ipsum...` | Roboto 11pt black |
| Row 3 text | TEXT_BOX | `Lorem ipsum...` | Roboto 11pt black |
| Row 4 text | TEXT_BOX | `Lorem ipsum...` | Roboto 11pt black |

Rows are organized in nested groups with separator lines between them.

---

### Slide 13: Contact
- **ObjectId:** `g3bae3fc4825_0_472`
- **Layout:** Custom (`g3bae3fc4825_0_259`)
- **Use when:** Always — penultimate slide. Contact info must always be asked from the user.

Header elements:

| Element ID | Type | Placeholder | Position (x,y) PT | Content |
|------------|------|-------------|-------------------|---------|
| `g3bae3fc4825_0_474` | TEXT_BOX | SUBTITLE | (24.4, 22.2) | `Section Subtitle` |
| `g3bae3fc4825_0_473` | TEXT_BOX | TITLE | (24.7, 39.4) | `Main Section Title` — replace with e.g. "Contacto" |
| `g3bae3fc4825_0_478` | TEXT_BOX | BODY | (25.7, 83.7) | Intro body text |
| `g3bae3fc4825_0_479` | TEXT_BOX | BODY | (25.7, 123.1) | Secondary body text (availability message) |
| `g3bae3fc4825_0_480` | TEXT_BOX | none | (24.3, 158.0) | `Contacto:` — Poppins 12pt orange |

**Contact card group** (`g3bae3fc4825_0_487`, 6 children):

| Child ID | Type | Content | Style |
|----------|------|---------|-------|
| `g3bae3fc4825_0_481` | ROUND_RECT | *(background)* | — |
| `g3bae3fc4825_0_484` | TEXT_BOX | `Cristian Álvarez` | Roboto 12pt orange — **REPLACE with contact name** |
| `g3bae3fc4825_0_482` | TEXT_BOX | `COO` | Roboto 11pt white — **REPLACE with contact role** |
| `g3bae3fc4825_0_483` | LINE | Separator | — |
| `g3bae3fc4825_0_485` | TEXT_BOX | `+34 626 17 12 86` | Roboto 11pt orange — **REPLACE with phone** |
| `g3bae3fc4825_0_486` | TEXT_BOX | `cristian@binpar.com` | Roboto 11pt white — **REPLACE with email** |

---

### Slide 14: Closing / Thank You
- **ObjectId:** `g3bae3fc4825_0_488`
- **Layout:** BLANK (`p12`)
- **Use when:** Always — last slide of every presentation

| Element ID | Type | Position (x,y) PT | Size (w,h) PT | Content |
|------------|------|-------------------|---------------|---------|
| `g3bae3fc4825_0_494` | TEXT_BOX | (24.5, 115.3) | (670.9, 92.5) | `GRACIAS` — Poppins 324pt bold orange |
| `g3bae3fc4825_0_495` | IMAGE | (309.0, 222.3) | (103.7, 51.9) | BinPar logo |
| `g3bae3fc4825_0_496` | RECTANGLE | (237.6, 204.0) | (244.8, 1.3) | Decorative line |
| `g3bae3fc4825_0_497` | RECTANGLE | (647.7, 13.6) | (72.3, 32.9) | Decorative element |

**Do NOT modify** the BinPar logo, decorative lines, or the "GRACIAS" text. This slide is used as-is.

---

## Image Insertion Reference

Summary of all image positions across layout types. Use these coordinates with `createImage` after deleting the template's sample images.

| Layout | Slide # | Images | Img 1 (x, y, w, h) PT | Img 2 (x, y, w, h) PT | Img 3 (x, y, w, h) PT |
|--------|---------|--------|------------------------|------------------------|------------------------|
| 2 Cols + Image | 6 | 1 | (382.0, 95.6, 306.2, 280.0) | — | — |
| 2 Blocks + Images | 7 | 2 | (124.4, 98.9, 115.0, 105.2) | (480.5, 98.9, 115.0, 105.2) | — |
| 3 Img Composition | 8 | 3 | (25.7, 95.6, 201.1, 230.0) | (259.9, 95.6, 201.1, 230.0) | (494.1, 95.6, 201.1, 230.0) |
| Full Image | 9 | 1 | (418.0, 0.0, 302.0, 405.0) | — | — |

**SVG/PNG target resolution (2x for retina):**

| Layout | Img 1 (w × h px) | Img 2 (w × h px) | Img 3 (w × h px) |
|--------|-------------------|-------------------|-------------------|
| 2 Cols + Image | 612 × 560 | — | — |
| 2 Blocks + Images | 230 × 210 | 230 × 210 | — |
| 3 Img Composition | 402 × 460 | 402 × 460 | 402 × 460 |
| Full Image | 604 × 810 | — | — |

---

## Speaker Notes

Each slide has a notes page accessible via `slideProperties.notesPage`. The notes page contains a BODY placeholder where speaker notes text can be inserted.

To add speaker notes:
1. From the presentation read response, find `slides[N].slideProperties.notesPage.pageElements`
2. Locate the element with `placeholder.type = "BODY"`
3. Use `insertText` on that element's objectId

---

## ObjectId Mapping After Duplication

When you duplicate a template slide with `duplicateObject`, the response contains:

```json
{
  "replies": [{
    "duplicateObject": {
      "objectId": "NEW_SLIDE_ID"
    }
  }]
}
```

To get the new element IDs, re-read the presentation after duplication. The new slide's elements will have system-generated IDs that differ from the template's. Map elements by their placeholder type, position, or content to identify which is which.

Alternatively, you can specify custom `objectIdsToReplace` in the `duplicateObject` request to control the new IDs, but this requires knowing all element IDs upfront.
