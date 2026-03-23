# SVG Generation Guide for Slide Visuals

This guide is used by subagents that generate SVG images for presentation slides. Each subagent receives a specific brief and must produce SVGs following the BinPar brand kit and technical requirements below.

## BinPar Brand Kit (Mandatory)

All SVGs must use ONLY these colors:

| Color | RGB | Hex | Usage |
|-------|-----|-----|-------|
| Primary orange | `rgb(253, 157, 0)` | `#FD9D00` | Primary shapes, accents, headings, highlights |
| Dark purple | `rgb(34, 32, 51)` | `#222033` | This is the slide background — SVGs sit on top of it |
| White | `rgb(255, 255, 255)` | `#FFFFFF` | Text, secondary shapes, outlines |
| Medium purple | `rgb(100, 70, 180)` | `#6446B4` | Supporting elements, secondary data |
| Muted purple | `rgb(80, 75, 110)` | `#504B6E` | Grid lines, subtle borders, tertiary elements |
| Light gray | `rgb(200, 200, 210)` | `#C8C8D2` | Minor labels, axis marks |

**Do NOT use any colors outside this palette.**

## Typography

- **Font family:** Always use `sans-serif` in SVG. Do NOT specify Poppins, Roboto, or any named font — they may not be available during conversion.
- **Minimum font size:** 14px at native SVG resolution for legibility
- **Heading weight:** `font-weight="700"` (bold)
- **Body weight:** `font-weight="400"` (normal)
- **Text color:** White (`#FFFFFF`) for most text. Orange (`#FD9D00`) for headings or emphasis only.
- **Text anchoring:** Use `text-anchor="middle"` for centered text, `text-anchor="start"` for left-aligned.

## Technical Requirements

1. **ViewBox:** Must match the target dimensions exactly. The main agent provides width and height.
   ```xml
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 WIDTH HEIGHT">
   ```

2. **Background:** The SVG MUST include a solid dark background rectangle as its **first child element**:
   ```xml
   <rect width="WIDTH" height="HEIGHT" fill="#222033"/>
   ```
   This is mandatory because Chrome headless does not support transparent PNG export — without this rect, the SVG renders on a white page background, making white text invisible and creating visible white borders when inserted into the dark slide. Do NOT rely on transparency; always embed the slide background color.

3. **No external dependencies:**
   - No `<link>` or `@import` for stylesheets
   - No external fonts (`@font-face`)
   - No external images (`<image xlink:href="http://...">`)
   - No JavaScript

4. **Style rules:**
   - Flat design only — no drop shadows, no 3D effects
   - No gradients (neither `<linearGradient>` nor `<radialGradient>`)
   - Clean geometric shapes, sharp edges, professional appearance
   - Use `stroke` and `fill` from the palette only
   - `stroke-width` between 1.5 and 3 for visible lines
   - Rounded corners: `rx="8"` on rectangles for a modern feel

5. **Output:** Save as a valid `.svg` file at the path specified by the main agent.

## SVG Categories

The main agent specifies which category the SVG should follow.

### Category A: Content Diagrams

For flowcharts, process diagrams, architecture diagrams, decision trees.

**Structure:**
- Rounded rectangles (`rx="8"`) as nodes with orange stroke (`stroke="#FD9D00"`, `stroke-width="2"`)
- White fill or transparent fill for nodes
- White text labels inside nodes (centered, `font-size="16"`)
- Connecting lines/arrows in white or orange
- Arrowheads using SVG `<marker>` definitions
- Minimum node size: 120×60px at native resolution
- Generous spacing between nodes (40px+ gaps)

**Example node:**
```xml
<rect x="50" y="50" width="160" height="70" rx="8" fill="none" stroke="#FD9D00" stroke-width="2"/>
<text x="130" y="92" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="400">Node Label</text>
```

**Example arrow:**
```xml
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFFFFF"/>
  </marker>
</defs>
<line x1="210" y1="85" x2="300" y2="85" stroke="#FFFFFF" stroke-width="2" marker-end="url(#arrow)"/>
```

### Category B: Data Visualizations

For bar charts, comparison charts, metric displays, progress indicators.

**Structure:**
- Orange bars/segments for primary data (`fill="#FD9D00"`)
- Medium purple bars for secondary data (`fill="#6446B4"`)
- White axis lines (`stroke="#FFFFFF"`, `stroke-width="1.5"`)
- Muted purple grid lines (`stroke="#504B6E"`, `stroke-width="1"`, `stroke-dasharray="4 4"`)
- White labels on axes, orange labels on data points
- Light gray for minor tick marks

**Bar chart pattern:**
```xml
<!-- Y axis -->
<line x1="60" y1="30" x2="60" y2="350" stroke="#FFFFFF" stroke-width="1.5"/>
<!-- X axis -->
<line x1="60" y1="350" x2="580" y2="350" stroke="#FFFFFF" stroke-width="1.5"/>
<!-- Bar -->
<rect x="100" y="120" width="50" height="230" rx="4" fill="#FD9D00"/>
<!-- Label -->
<text x="125" y="380" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="14">Q1</text>
```

### Category C: Concept Illustrations

For icons, abstract representations, decorative visuals, metaphorical imagery.

**Structure:**
- Large central shape or icon in orange (`fill="#FD9D00"`)
- Supporting geometric elements in medium purple or white
- Clean negative space — don't overcrowd
- Symmetric or balanced composition
- Abstract/geometric style — no realistic illustrations

**Good patterns:**
- Concentric circles with varying opacity
- Interconnected nodes (network/constellation)
- Layered geometric shapes
- Abstract tech patterns (circuits, connections)
- Circular/radial arrangements

### Category D: Timelines / Processes

For horizontal timelines, step sequences, project phases.

**Structure:**
- Horizontal layout preferred (fits wide slide aspect ratios)
- Orange filled circles for milestones (`r="12"`, `fill="#FD9D00"`)
- White connecting line (`stroke="#FFFFFF"`, `stroke-width="2"`)
- White labels below milestones
- Small orange numbers or labels inside milestone circles
- Date/phase labels in light gray below the line

**Timeline pattern:**
```xml
<!-- Connecting line -->
<line x1="50" y1="200" x2="560" y2="200" stroke="#FFFFFF" stroke-width="2"/>
<!-- Milestone -->
<circle cx="120" cy="200" r="14" fill="#FD9D00"/>
<text x="120" y="205" text-anchor="middle" fill="#222033" font-family="sans-serif" font-size="12" font-weight="700">1</text>
<text x="120" y="235" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="14">Phase 1</text>
<text x="120" y="255" text-anchor="middle" fill="#C8C8D2" font-family="sans-serif" font-size="11">Jan 2026</text>
```

## Subagent Prompt Template

The main agent constructs the subagent prompt using this template:

```
Generate an SVG image for a presentation slide. Write the SVG using Python — create the XML string and save it to a file.

**Slide topic:** [topic]
**Image purpose:** [Category A/B/C/D from svg-generation-guide.md]
**What to represent:** [specific content description]
**Dimensions:** viewBox="0 0 [width] [height]" (these are 2x PT values for retina)
**Save to:** [file path, e.g., ./slide_assets/slide_3_img_1.svg]

**Mandatory brand constraints:**
- **BACKGROUND:** You MUST add a dark background rectangle as the FIRST element of the SVG: `<rect width="[width]" height="[height]" fill="#222033"/>`. This is MANDATORY — Chrome cannot render transparent PNGs, so without this the image will have a white background.
- Primary: #FD9D00 (orange) — main shapes and accents
- Text: #FFFFFF (white) — all text (will be invisible without the dark background!)
- Secondary: #6446B4 (medium purple) — supporting elements
- Tertiary: #504B6E (muted purple) — grid lines, subtle borders
- Font: sans-serif only, minimum 14px, bold for headings
- Style: flat, geometric, clean, professional. NO gradients, shadows, or 3D effects.

Generate the SVG as a Python string and write it to the specified file path using:
with open("[path]", "w") as f:
    f.write(svg_content)
```

## Dimension Calculation

The main agent calculates SVG dimensions from the layout's image position (documented in `references/template-structure.md`):

```
SVG viewBox width  = layout_image_width_PT × 2   (for 2x retina)
SVG viewBox height = layout_image_height_PT × 2
```

**Pre-calculated dimensions per layout:**

| Layout | Image slot | viewBox dimensions |
|--------|-----------|-------------------|
| 2 Cols + Image | Single image | `612 × 560` |
| 2 Blocks + Images | Each of 2 images | `230 × 210` |
| 3 Img Composition | Each of 3 images | `402 × 460` |
| Full Image | Single image | `604 × 810` |

## Validation Checklist

Before saving the SVG, verify:
- [ ] `viewBox` matches the requested dimensions
- [ ] No colors outside the brand palette
- [ ] No external dependencies (fonts, images, stylesheets)
- [ ] No gradients or shadows
- [ ] First element is `<rect width="W" height="H" fill="#222033"/>` (dark background — required for Chrome rendering)
- [ ] All text uses `font-family="sans-serif"`
- [ ] All text is at least 14px
- [ ] File is valid XML (proper closing tags, escaped entities)
