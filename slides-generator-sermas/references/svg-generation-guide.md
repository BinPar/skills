# SVG Generation Guide for Slide Visuals

This guide is used by subagents that generate SVG images for presentation slides. Each subagent receives a specific brief and must produce SVGs following the Sermas brand kit and technical requirements below.

Sermas visuals live on a **white background** — this is the single biggest difference from a dark-themed deck. Text must be dark, not white; the mandatory background rect is `#FFFFFF`, not a dark color.

## Sermas Brand Kit (Mandatory)

All SVGs must use ONLY these colors:

| Color | RGB | Hex | Usage |
|-------|-----|-----|-------|
| Primary blue | `rgb(47, 85, 151)` | `#2F5597` | Primary shapes, accents, headings, highlights |
| Background | `rgb(255, 255, 255)` | `#FFFFFF` | This is the slide background — SVGs sit on top of it |
| Primary text | `rgb(0, 0, 0)` | `#000000` | Body text, labels |
| Muted text | `rgb(89, 89, 89)` | `#595959` | Secondary text, captions |
| Tertiary gray | `rgb(136, 136, 136)` | `#888888` | Grid lines, subtle borders, tertiary labels |
| Light gray fill | `rgb(230, 230, 230)` | `#E6E6E6` | Subtle card fills, chart backgrounds (use sparingly) |

**Do NOT use any colors outside this palette.** In particular: no orange, no purple — these are BinPar's palette, not Sermas's.

## Typography

- **Font family:** Always use `sans-serif` in SVG. Do NOT specify Calibri, Arial, or any named font — they may not be available during conversion.
- **Minimum font size:** 14px at native SVG resolution for legibility
- **Heading weight:** `font-weight="700"` (bold)
- **Body weight:** `font-weight="400"` (normal)
- **Text color:** Black (`#000000`) for most text. Primary blue (`#2F5597`) for headings, numerals, or emphasis. **Never use white text** — the slide background is white.
- **Text anchoring:** Use `text-anchor="middle"` for centered text, `text-anchor="start"` for left-aligned.

## Technical Requirements

1. **ViewBox:** Must match the target dimensions exactly. The main agent provides width and height.
   ```xml
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 WIDTH HEIGHT">
   ```

2. **Background:** The SVG MUST include a solid white background rectangle as its **first child element**:
   ```xml
   <rect width="WIDTH" height="HEIGHT" fill="#FFFFFF"/>
   ```
   This is mandatory because Chrome headless does not support transparent PNG export reliably — without this rect, conversion can produce unpredictable artifacts. The white background also matches the Sermas slide background, so the image blends seamlessly.

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
   - Prefer outlines + subtle fills over heavy color blocks (Sermas aesthetic is institutional/minimalist)

5. **Output:** Save as a valid `.svg` file at the path specified by the main agent.

## SVG Categories

The main agent specifies which category the SVG should follow.

### Category A: Content Diagrams

For flowcharts, process diagrams, architecture diagrams, decision trees.

**Structure:**
- Rounded rectangles (`rx="8"`) as nodes with blue stroke (`stroke="#2F5597"`, `stroke-width="2"`)
- White fill for nodes (or very light gray `#E6E6E6` for subtle differentiation)
- Black text labels inside nodes (centered, `font-size="16"`)
- Connecting lines/arrows in blue or dark gray
- Arrowheads using SVG `<marker>` definitions
- Minimum node size: 120×60px at native resolution
- Generous spacing between nodes (40px+ gaps)

**Example node:**
```xml
<rect x="50" y="50" width="160" height="70" rx="8" fill="#FFFFFF" stroke="#2F5597" stroke-width="2"/>
<text x="130" y="92" text-anchor="middle" fill="#000000" font-family="sans-serif" font-size="16" font-weight="400">Node Label</text>
```

**Example arrow:**
```xml
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2F5597"/>
  </marker>
</defs>
<line x1="210" y1="85" x2="300" y2="85" stroke="#2F5597" stroke-width="2" marker-end="url(#arrow)"/>
```

### Category B: Data Visualizations

For bar charts, comparison charts, metric displays, progress indicators.

**Structure:**
- Blue bars/segments for primary data (`fill="#2F5597"`)
- Muted gray bars for secondary data (`fill="#888888"`)
- Black axis lines (`stroke="#000000"`, `stroke-width="1.5"`)
- Gray grid lines (`stroke="#E6E6E6"`, `stroke-width="1"`, solid or `stroke-dasharray="4 4"`)
- Black labels on axes, blue labels on data points
- Muted gray for minor tick marks

**Bar chart pattern:**
```xml
<!-- Y axis -->
<line x1="60" y1="30" x2="60" y2="350" stroke="#000000" stroke-width="1.5"/>
<!-- X axis -->
<line x1="60" y1="350" x2="580" y2="350" stroke="#000000" stroke-width="1.5"/>
<!-- Bar -->
<rect x="100" y="120" width="50" height="230" rx="4" fill="#2F5597"/>
<!-- Label -->
<text x="125" y="380" text-anchor="middle" fill="#000000" font-family="sans-serif" font-size="14">Q1</text>
```

### Category C: Concept Illustrations

For icons, abstract representations, decorative visuals, metaphorical imagery.

**Structure:**
- Large central shape or icon in primary blue (`fill="#2F5597"` or outline-only with `stroke="#2F5597"`)
- Supporting geometric elements in gray or outlined
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
- Blue filled circles for milestones (`r="12"`, `fill="#2F5597"`)
- Black (or dark gray) connecting line (`stroke="#000000"`, `stroke-width="2"`)
- Black labels below milestones
- Small white numbers inside milestone circles
- Date/phase labels in muted gray below the line

**Timeline pattern:**
```xml
<!-- Connecting line -->
<line x1="50" y1="200" x2="560" y2="200" stroke="#000000" stroke-width="2"/>
<!-- Milestone -->
<circle cx="120" cy="200" r="14" fill="#2F5597"/>
<text x="120" y="205" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="700">1</text>
<text x="120" y="235" text-anchor="middle" fill="#000000" font-family="sans-serif" font-size="14">Phase 1</text>
<text x="120" y="255" text-anchor="middle" fill="#595959" font-family="sans-serif" font-size="11">Jan 2026</text>
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
- **BACKGROUND:** You MUST add a white background rectangle as the FIRST element of the SVG: `<rect width="[width]" height="[height]" fill="#FFFFFF"/>`. This is MANDATORY — Chrome rendering can produce transparent/broken backgrounds otherwise, and this matches the Sermas white slide.
- Primary: #2F5597 (blue) — main shapes and accents
- Text: #000000 (black) — all body text. Use #2F5597 for headings or emphasis. Never use white text (background is white).
- Secondary: #595959 / #888888 (gray) — muted text, secondary shapes
- Font: sans-serif only, minimum 14px, bold for headings
- Style: flat, geometric, clean, institutional/minimalist. NO gradients, shadows, or 3D effects.

Generate the SVG as a Python string and write it to the specified file path using:
with open("[path]", "w") as f:
    f.write(svg_content)
```

## Dimension Calculation

The Sermas template has no layouts with predefined image slots, so the main agent picks coordinates per slide (see `references/template-structure.md` § Image Insertion Reference).

```
SVG viewBox width  = insertion_width_PT × 2   (for 2x retina)
SVG viewBox height = insertion_height_PT × 2
```

**Common dimensions (starting points):**

| Use case | Placement (PT) | Size (PT) | SVG viewBox (2× retina) |
|----------|---------------|-----------|--------------------------|
| Half-width supporting visual | right half of slide | 420 × 330 | `840 × 660` |
| Hero diagram centered under title | centered | 720 × 380 | `1440 × 760` |
| Full-width data chart | near full slide width | 880 × 380 | `1760 × 760` |

These are starting values — the main agent may pick different dimensions per slide based on content.

## Validation Checklist

Before saving the SVG, verify:
- [ ] `viewBox` matches the requested dimensions
- [ ] No colors outside the Sermas brand palette (no orange, no purple, no unplanned reds/greens)
- [ ] No external dependencies (fonts, images, stylesheets)
- [ ] No gradients or shadows
- [ ] First element is `<rect width="W" height="H" fill="#FFFFFF"/>` (white background — required for Chrome rendering and to match the slide)
- [ ] All text uses `font-family="sans-serif"`
- [ ] All text is at least 14px
- [ ] All text is dark (black or `#2F5597`), never white (invisible on white background)
- [ ] File is valid XML (proper closing tags, escaped entities)
