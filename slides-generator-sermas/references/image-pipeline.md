# Image Pipeline

Complete lifecycle for generating and inserting visual assets into Sermas Google Slides presentations.

```
SVG Generation (subagent) → SVG→PNG Conversion → Drive Upload → Set Permission → createImage → Drive Cleanup
```

Images are **optional** for Sermas decks. The template is text-heavy by design and has no layouts with pre-positioned image slots. Only run this pipeline when content clearly benefits from a visual (process diagrams, data charts, org structures) or when the user explicitly requests one.

## Step 1: Setup

```bash
mkdir -p ./slide_assets
```

All image files must be in the working directory or a subdirectory — the `gws --upload` flag rejects external paths.

## Step 2: SVG Generation (Parallel Subagents)

For every slide that needs an image, spawn a subagent with the prompt template from `references/svg-generation-guide.md`. All subagents can run in parallel — there is no dependency between them.

Each subagent saves its SVG to `./slide_assets/slide_N_img_M.svg` where N is the slide number and M is the image slot (1-indexed).

## Step 3: SVG → PNG Conversion

Detect the best available converter once at the start, then reuse for all images. Check in this priority order:

### Option 1: cairosvg (Python) — Preferred

```bash
python3 -c "import cairosvg; print('available')" 2>/dev/null
```

If available, convert each SVG:

```python
import cairosvg
cairosvg.svg2png(
    url='./slide_assets/slide_N_img_M.svg',
    write_to='./slide_assets/slide_N_img_M.png',
    output_width=TARGET_WIDTH,
    output_height=TARGET_HEIGHT
)
```

Where `TARGET_WIDTH` and `TARGET_HEIGHT` are the SVG viewBox dimensions (already 2x for retina).

### Option 2: Inkscape (CLI)

```bash
which inkscape 2>/dev/null
```

If available:

```bash
inkscape --export-type=png \
  --export-filename=./slide_assets/slide_N_img_M.png \
  --export-width=TARGET_WIDTH \
  ./slide_assets/slide_N_img_M.svg
```

### Option 3: Chrome Headless

```bash
# macOS
ls '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' 2>/dev/null
# Linux
which google-chrome 2>/dev/null || which chromium 2>/dev/null
```

If available, **do NOT screenshot the SVG file directly** — Chrome adds default page margins and cannot produce transparent PNGs reliably. Instead, create an HTML wrapper for each SVG:

```bash
# 1. Create an HTML wrapper that eliminates margins and forces exact dimensions
cat > ./slide_assets/slide_N_img_M.html << EOF
<!DOCTYPE html><html><head><style>*{margin:0;padding:0}html,body{width:${TARGET_WIDTH}px;height:${TARGET_HEIGHT}px;overflow:hidden;background:#FFFFFF}</style></head>
<body><img src="slide_N_img_M.svg" width="${TARGET_WIDTH}" height="${TARGET_HEIGHT}" style="display:block"></body></html>
EOF

# 2. Screenshot the HTML wrapper (not the SVG directly)
#    --force-device-scale-factor=2 renders at 2x pixel density for sharper output
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless --disable-gpu --no-sandbox \
  --force-device-scale-factor=2 \
  --screenshot=./slide_assets/slide_N_img_M.png \
  --window-size=${TARGET_WIDTH},${TARGET_HEIGHT} \
  "file://$(pwd)/slide_assets/slide_N_img_M.html"
```

**Why HTML wrappers are required:**
- Chrome adds 8px default body margins when rendering standalone SVGs, causing cropping
- Small images are especially affected by margin issues
- The HTML wrapper with `margin:0; padding:0; overflow:hidden` guarantees pixel-perfect output

**Important:** SVGs must also include a `<rect fill="#FFFFFF"/>` background as their first element (see svg-generation-guide.md). This is a belt-and-suspenders approach — the HTML background matches the SVG background matches the Sermas white slide background.

### Option 4: Pillow Fallback (No SVG)

If no SVG converter is available, skip SVG generation entirely. Instead, instruct subagents to generate PNGs directly using Pillow/PIL:

```python
from PIL import Image, ImageDraw, ImageFont

img = Image.new('RGBA', (TARGET_WIDTH, TARGET_HEIGHT), (255, 255, 255, 255))
draw = ImageDraw.Draw(img)

# Sermas colors
BLUE = (47, 85, 151, 255)
BLACK = (0, 0, 0, 255)
MUTED = (89, 89, 89, 255)
GRAY = (136, 136, 136, 255)

# Draw shapes and text using ImageDraw methods
draw.rounded_rectangle([x1, y1, x2, y2], radius=8, outline=BLUE, width=2)
draw.text((x, y), "Label", fill=BLACK, font=ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24))

img.save('./slide_assets/slide_N_img_M.png')
```

When using Pillow fallback, modify the subagent prompt to request PNG generation instead of SVG. The brand kit colors and dimensions remain the same.

## Step 4: Upload to Google Drive

For each PNG file:

```bash
CI=true gws drive files create \
  --upload ./slide_assets/slide_N_img_M.png \
  --json '{"name": "slide_N_img_M.png", "mimeType": "image/png"}' \
  --params '{"uploadType": "multipart"}'
```

Extract `id` from the response JSON.

**Note:** The `parents` field is optional for temp uploads — omitting it places the file in Drive root, which is fine since we'll delete it after insertion.

## Step 5: Set Public Permission

The `createImage` API fetches images by URL, so the file must be publicly readable:

```bash
CI=true gws drive permissions create \
  --params '{"fileId": "UPLOADED_FILE_ID"}' \
  --json '{"role": "reader", "type": "anyone"}'
```

## Step 6: Build Image URL

```
https://drive.google.com/uc?export=download&id=UPLOADED_FILE_ID
```

Store a mapping of `(slide_number, image_slot) → (drive_file_id, url)` for use in the insertion step.

## Step 7: Insert into Slides

Sermas content slides (duplicated from `p3`) do not ship with sample image placeholders. If you decide to replace the body text box with a visual, first delete that box:

```json
{"deleteObject": {"objectId": "BODY_BOX_OBJECT_ID"}}
```

Then insert the generated image at the chosen position (see `references/template-structure.md` § Image Insertion Reference for starting coordinates):

```json
{
  "createImage": {
    "url": "https://drive.google.com/uc?export=download&id=FILE_ID",
    "elementProperties": {
      "pageObjectId": "SLIDE_OBJECT_ID",
      "size": {
        "width": {"magnitude": WIDTH_PT, "unit": "PT"},
        "height": {"magnitude": HEIGHT_PT, "unit": "PT"}
      },
      "transform": {
        "scaleX": 1,
        "scaleY": 1,
        "translateX": X_PT,
        "translateY": Y_PT,
        "unit": "PT"
      }
    }
  }
}
```

### Starting Coordinates

The Sermas template has no predefined image slots. Pick one of these safe starting positions (they avoid the inherited top-right logo and bottom-left "Página" footer):

| Use case | x (PT) | y (PT) | w (PT) | h (PT) | SVG viewBox (2× retina) |
|----------|--------|--------|--------|--------|--------------------------|
| Half-width visual, right side of content slide | 500 | 150 | 420 | 330 | `840 × 660` |
| Hero diagram, centered below title | 120 | 120 | 720 | 380 | `1440 × 760` |
| Full-width data chart | 40 | 120 | 880 | 380 | `1760 × 760` |

Tune per slide based on remaining text. Keep at least 30 PT of margin around the logo area (x > 60 on the right, y > 50 top) and the footer (y < 500 bottom).

## Step 8: Visual Verification (MANDATORY)

After inserting all images, visually verify every slide that contains generated images. This step catches clipping, misalignment, and quality issues that are invisible from the API alone.

### 8.1 Get slide thumbnails

For each slide that has images, request a thumbnail using the Slides API:

```bash
CI=true gws slides presentations pages getThumbnail \
  --params '{"presentationId": "PRES_ID", "pageObjectId": "SLIDE_OBJECT_ID", "thumbnailProperties.thumbnailSize": "LARGE"}'
```

This returns a JSON with a `contentUrl` field — a temporary URL to a PNG thumbnail of the rendered slide.

### 8.2 Download and inspect

Download the thumbnail and inspect it visually using the Read tool (which supports images):

```bash
curl -sL "THUMBNAIL_CONTENT_URL" -o /tmp/slide_N_thumb.png
```

Then use the Read tool on `/tmp/slide_N_thumb.png` to view it.

### 8.3 Check for issues

When inspecting each thumbnail, verify:

- [ ] **No clipping:** All image content is visible within the slide boundaries — no text or shapes cut off at edges
- [ ] **No dark borders or stripes:** The image blends seamlessly with the white slide background on all sides (white-on-white is the Sermas norm)
- [ ] **Correct positioning:** The image is in the expected slot (right half, centered, full) without overlap on the logo (top-right), page footer (bottom-left), or title text
- [ ] **Text readability:** Any text within the generated image is legible at the thumbnail resolution
- [ ] **Visual quality:** The image looks clean and professional, not blurry or pixelated

### 8.4 Fix issues if found

If any check fails:

1. **Clipping:** The SVG content exceeds the viewBox. Regenerate the SVG with more padding (add 10-15% margin inside the viewBox) or simplify the content to fit.
2. **Dark borders / visible box outline:** The `<rect fill="#FFFFFF"/>` background is missing or doesn't cover the full viewBox. Fix the SVG and reconvert.
3. **Misalignment:** Delete the image and re-insert with corrected coordinates.
4. **Poor quality:** Reconvert using `--force-device-scale-factor=2` in Chrome for higher pixel density, or switch to cairosvg.
5. **Overlap with logo / footer:** Reduce image size or shift away from the top-right and bottom-left corners.

After fixing, re-insert the image and re-verify. Repeat until all slides pass.

### 8.5 Cleanup thumbnails

```bash
rm -f /tmp/slide_*_thumb.png
```

## Step 9: Cleanup

After all images are successfully inserted, clean up temporary files:

```bash
# Delete each uploaded image from Drive
CI=true gws drive files delete --params '{"fileId": "FILE_ID_1"}'
CI=true gws drive files delete --params '{"fileId": "FILE_ID_2"}'
# ... repeat for each uploaded file

# Delete local assets
rm -rf ./slide_assets/
```

**Important:** Only delete Drive files after verifying the presentation looks correct. If `createImage` failed for any slide, retain the Drive files and retry the insertion.

## Error Recovery

| Failure Point | Symptom | Recovery |
|---------------|---------|----------|
| SVG generation | Subagent error or invalid XML | Re-spawn subagent with simpler instructions; reduce visual complexity |
| SVG conversion | Blank or corrupt PNG | Check SVG is valid XML; try alternative converter from the priority list |
| Drive upload | 403 or 500 error | Retry once; check auth with `CI=true gws auth status` |
| Permission set | 403 error | File may already be public; proceed with insertion |
| createImage | 400 error | URL not accessible — verify permission was set; try re-uploading |
| createImage | 400 "invalid image" | PNG may be corrupt — reconvert from SVG or regenerate |
| Cleanup fails | 404 on delete | File may already be deleted; non-critical, log and continue |
| Visual check: clipping | SVG content exceeds viewBox | Regenerate SVG with 10-15% internal padding or simplify content |
| Visual check: dark border | Missing white background rect | Verify `<rect fill="#FFFFFF"/>` is first SVG element; use HTML wrapper |
| Visual check: blurry/low quality | 1x rendering | Add `--force-device-scale-factor=2` to Chrome command |
| Visual check: overlaps logo / footer | Insertion coords too close to corners | Reduce size or shift position (see starting coordinates above) |

## Conversion Tool Installation

If no converter is available, suggest installing cairosvg:

```bash
pip3 install cairosvg
```

Or for system-wide installation:

```bash
brew install cairo  # macOS dependency for cairosvg
pip3 install cairosvg
```
