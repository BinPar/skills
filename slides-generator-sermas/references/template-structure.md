# Sermas Template Structure

Complete catalog of the Sermas / Comunidad de Madrid — Consejería de Digitalización presentation template, including slide objectIds, element structure, and design tokens.

## Template Properties

- **Template Name:** Sermas Presentation Template
- **Template ID:** `1shVwhiGRIgLml3TB9SUMsEW_OwS0HHDsuH2bb3MMaVc`
- **Template URL:** https://docs.google.com/presentation/d/1shVwhiGRIgLml3TB9SUMsEW_OwS0HHDsuH2bb3MMaVc/edit
- **Origin:** Converted from the source PowerPoint `OP_LAN_Presentación lanzamiento Proyecto v1.0.pptx` (file ID `1EVu0iCDKeFpzOFTa75JuFzOzSACOQFY-`) using `gws drive files copy` with `mimeType=application/vnd.google-apps.presentation`.
- **Owner / issuer:** Comunidad de Madrid — Dirección General de Salud Digital — Consejería de Digitalización (aka Sermas, the Servicio Madrileño de Salud).
- **Page size:** 960 × 540 PT (13.333" × 7.5", 16:9 widescreen — the PowerPoint default).
- **Locale:** `es-ES`
- **Master:** `p7` ("Office Theme"). Background fill inherits from master = white (`LIGHT1`).

## Design Tokens

### Color palette (derived from actual deck usage)

| Color | RGB | Hex | Usage |
|-------|-----|-----|-------|
| Primary blue | `rgb(47, 85, 151)` | `#2F5597` | Accents, headings, number highlights, TOC sidebar, dividing lines |
| Blue variant | `rgb(47, 84, 150)` | `#2F5496` | Same role (slight drift in source file) |
| Background | `rgb(255, 255, 255)` | `#FFFFFF` | Slide background |
| Primary text | `rgb(0, 0, 0)` | `#000000` | Body text, titles |
| Muted text | `rgb(89, 89, 89)` | `#595959` | Secondary text, section titles on TOC |
| Tertiary gray | `rgb(136, 136, 136)` | `#888888` | Footer page number, fine labels |

### Typography

- **Title font:** Calibri (sizes vary — 32pt default at layout level, much larger on cover / section dividers / closing)
- **Body font:** Arial (14pt default at layout level)
- **In SVGs:** Always `sans-serif`

## Master & Layouts

| Layout objectId | Name | Purpose | Slides using it |
|-----------------|------|---------|-----------------|
| `p8` | Title Only | Cover layout | `p1` |
| `p9` | 1_Title Only | Standard content / section divider / closing | `p2`, `p3`, `p4`, `p5`, `p6` |
| `p10` | 2_Title Only | Alternate (not instantiated) | — |

### Layout `p9` (inherited by every content slide)

Every slide using this layout inherits two fixed elements — **do NOT modify them**:

| Element objectId | Type | Position (PT) | Role |
|------------------|------|---------------|------|
| `p9_i3` | IMAGE | (829, 7) | Comunidad de Madrid logo, top-right corner |
| `p9_i7` | TEXT_BOX | (16, 506) | "Página" footer, bottom-left |

## Slide Catalog (6 slides)

| # | objectId | Layout | Role | Duplicable? |
|---|----------|--------|------|-------------|
| 1 | `p1` | `p8` | Cover / title | No — edit text in place |
| 2 | `p2` | `p9` | Index / Table of Contents (fixed 8-section grid) | No — edit text in place |
| 3 | `p3` | `p9` | Generic content slide ("01 Introducción" + OBJETIVO/ANTECEDENTES) | **Yes** — duplicate for each content slide |
| 4 | `p4` | `p9` | Duplicate of p3 (identical structure) | Yes |
| 5 | `p5` | `p9` | "ANEXO" section divider (large blue title + stethoscope image) | Yes (duplicate for new dividers) |
| 6 | `p6` | `p9` | "GRACIAS" closing slide — **immutable** | **No** — never modify |

### Slide p1 — Cover

| Element objectId | Type | Position (PT) | Default text / role |
|------------------|------|---------------|---------------------|
| `p1_i18` | TEXT_BOX | (54.5, 165.6) | `<Nombre Proyecto>: Lanzamiento del proyecto` — project title (replace) |
| `p1_i19` | TEXT_BOX | (54.5, 447.3) | `En Madrid, a xx de septiembre de xxxx` — date line, Calibri 18pt (replace) |

The cover also renders (from layout p8) the Comunidad de Madrid logo and the healthcare imagery on the right — do not delete them.

### Slide p2 — Index (Table of Contents)

Fixed chrome:
| Element | Type | Position (PT) | Role |
|---------|------|---------------|------|
| `p2_i5` | RECTANGLE | (0, 119) | Blue sidebar, full slide height |
| `p2_i7` | TEXT_BOX | (33, 260) | "INDICE" white title inside sidebar |
| `p2_i2` | TEXT_BOX | (16, 506) | "Página" footer |

Section number boxes (large blue numeral):

| Column | Row 1 (y≈86) | Row 2 (y≈272) |
|--------|--------------|----------------|
| 1 (x≈261) | `p2_i8` — "01" | `p2_i30` — "05" |
| 2 (x≈423) | `p2_i10` — "02" | `p2_i31` — "06" |
| 3 (x≈606) | `p2_i12` — "03" | `p2_i32` — "07" |
| 4 (x≈796) | `p2_i18` — "04" | `p2_i35` — "08" |

Section title boxes (gray text under the number):

| Column | Row 1 (y≈190) | Row 2 (y≈378) |
|--------|---------------|----------------|
| 1 | `p2_i6` — "Introducción" | `p2_i20` — "Metodología y herramientas" |
| 2 | `p2_i9` — "Alcance del proyecto" | `p2_i3` — "Matriz de riesgos" |
| 3 | `p2_i11` — "Plan de proyecto" | `p2_i38` — "Próximos pasos" |
| 4 | `p2_i14` — "Roles y responsabilidades" | `p2_i39` — "Ruegos y preguntas" |

Blue underline lines beneath each number (decorative): `p2_i15`, `p2_i16`, `p2_i24`, `p2_i25`, `p2_i33`, `p2_i34`, `p2_i36`, `p2_i37`.

### Slides p3 / p4 — Generic Content Slide

Both slides are structurally identical. Use `duplicateObject` on `p3` for each new content slide.

| Element objectId | Type | Position (PT) | Default text / role |
|------------------|------|---------------|---------------------|
| `p3_i17` | TEXT_BOX | (98, 16) | Section title — currently `Introducción` |
| `p3_i7` | RECTANGLE | (20, 87) | Body box — currently `<Incluir en esta sección…>` + `OBJETIVO` + `ANTECEDENTES` bullets |
| `p3_i4` | GROUP | (0, 0) | Decorative group containing the blue numeral "01" + underline |
| &nbsp;&nbsp;`p3_i16` | line (inside group) | (17, 64) | Blue underline below numeral |
| &nbsp;&nbsp;`p3_i3` | TEXT_BOX (inside group) | (9, −26) | Large blue numeral — currently "01" |

**Per-content-slide fill plan:**
1. Replace numeral (inside the group) with the section number (01, 02, 03, …). Immediately follow with `updateTextStyle` to restore the canonical numeral style (Calibri 66 PT bold, `rgb(0.184, 0.333, 0.592)`) — without this, the insert falls back to Arial 14 PT and the big blue "01" visually vanishes.
2. Replace section title (`*_i17`) with the section's title. Immediately follow with `updateTextStyle` to enforce Calibri 24 PT, not bold, `rgb(0.4, 0.4, 0.4)` — otherwise the title commonly renders red or in an unintended weight depending on which placeholder run survives.
3. Replace body (`*_i7`) with the slide's content, first removing the template placeholder text. Follow with `updateTextStyle` enforcing Calibri 14–18 PT, `italic: false`, DARK1 theme color — the `<Incluir en esta sección…>` italic placeholder style otherwise bleeds into your content.

**Canonical style summary** (enforce after each `insertText`):

| Role | Object | Font | Size | Weight | Color |
|------|--------|------|------|--------|-------|
| Numeral | group child TEXT_BOX | Calibri | 66 PT | bold | `rgb(0.184, 0.333, 0.592)` ≈ `#2F5497` |
| Section title | `*_i17` role | Calibri | 24 PT | regular | `rgb(0.4, 0.4, 0.4)` ≈ `#666666` |
| Body | `*_i7` role | Calibri | 14–18 PT | regular | DARK1 theme (black) |
| TOC section title | `p2_i6`/`p2_i9`/… | Calibri | 22 PT | regular | `rgb(0.349, 0.349, 0.349)` ≈ `#595959` |

### Slide p5 — "ANEXO" Section Divider

| Element objectId | Type | Position (PT) | Default text / role |
|------------------|------|---------------|---------------------|
| `p5_i6` | TEXT_BOX | (68, 229) | `ANEXO` — large blue title (replace for custom divider text) |
| `p5_i21` | TEXT_BOX | (16, 506) | `Página` footer |
| `p5_i5` | IMAGE | (601, 74), effective ~358×465 PT | Stethoscope photo — decorative, do not touch |

### Slide p6 — "GRACIAS" Closing (IMMUTABLE)

| Element objectId | Type | Position (PT) | Role |
|------------------|------|---------------|------|
| `p6_i23` | IMAGE | (601, 74), effective ~358×465 PT | Stethoscope photo — **do not modify** |
| `p6_i6` | TEXT_BOX | (68, 229) | `GRACIAS` — **do not modify** |
| `p6_i21` | TEXT_BOX | (16, 506) | `Página` footer — **do not modify** |

**Rule:** Slide `p6` is the closing and must never be mutated.

## Image Insertion Reference

The Sermas template does **not** have layouts with pre-positioned image slots. When the skill generates SVG visuals, it must choose coordinates based on the target slide's empty space.

Recommended insertion coordinates on a duplicated content slide:

| Use case | x (PT) | y (PT) | width (PT) | height (PT) |
|----------|--------|--------|-----------|-------------|
| Supporting visual, right half of content slide | 500 | 150 | 420 | 330 |
| Hero diagram, centered below title | 120 | 120 | 720 | 380 |
| Half-width visual, right of body text | 500 | 110 | 420 | 360 |
| Full-width data chart | 40 | 120 | 880 | 380 |

The skill defaults to text-only slides. Only produce SVG visuals when the user explicitly asks or when content clearly benefits.

## ObjectId Mapping After Duplication

After `duplicateObject`, all child elements receive fresh system-generated objectIds. Identify copied elements by:

1. **Position**: title box is near `y ≈ 16`; body box at `y ≈ 87`; numeral group at `(0, 0)`.
2. **Type**: `TEXT_BOX` vs `RECTANGLE` vs `GROUP`.
3. **Text content**: placeholders like "Introducción", "OBJETIVO", "01" survive duplication.

Cache the mapping `{slide_index: {title_id, body_id, numeral_group_id, numeral_text_id}}` before issuing text-fill batchUpdates.
