# Image Pipeline

Complete lifecycle for generating and inserting visual assets into Google Slides presentations.

```
SVG Generation (subagent) → SVG→PNG Conversion → Drive Upload → Set Permission → createImage → Drive Cleanup
```

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

If available, **do NOT screenshot the SVG file directly** — Chrome adds default page margins and cannot produce transparent PNGs reliably (`--default-background-color=0` is broken in modern Chrome versions). Instead, create an HTML wrapper for each SVG:

```bash
# 1. Create an HTML wrapper that eliminates margins and forces exact dimensions
cat > ./slide_assets/slide_N_img_M.html << EOF
<!DOCTYPE html><html><head><style>*{margin:0;padding:0}html,body{width:${TARGET_WIDTH}px;height:${TARGET_HEIGHT}px;overflow:hidden;background:#222033}</style></head>
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
- Chrome adds 8px default body margins when rendering standalone SVGs, causing cropping and white borders
- The `--default-background-color` flag expects hex values in modern Chrome and `0` (for transparent) no longer works
- Small images (e.g., 230×210) are especially affected by margin issues
- The HTML wrapper with `margin:0; padding:0; overflow:hidden` guarantees pixel-perfect output

**Important:** SVGs must also include a `<rect fill="#222033"/>` background as their first element (see svg-generation-guide.md). This is a belt-and-suspenders approach — the HTML background matches the SVG background matches the slide background.

### Option 4: Pillow Fallback (No SVG)

If no SVG converter is available, skip SVG generation entirely. Instead, instruct subagents to generate PNGs directly using Pillow/PIL:

```python
from PIL import Image, ImageDraw, ImageFont

img = Image.new('RGBA', (TARGET_WIDTH, TARGET_HEIGHT), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Use BinPar colors
ORANGE = (253, 157, 0, 255)
WHITE = (255, 255, 255, 255)
PURPLE = (100, 70, 180, 255)

# Draw shapes and text using ImageDraw methods
draw.rounded_rectangle([x1, y1, x2, y2], radius=8, outline=ORANGE, width=2)
draw.text((x, y), "Label", fill=WHITE, font=ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24))

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

First, delete any existing template images on the duplicated slide (they're sample placeholders):

```json
{"deleteObject": {"objectId": "EXISTING_IMAGE_ELEMENT_ID"}}
```

Then insert the generated image at the correct position:

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

### Image Positions Per Layout

Use these exact coordinates (from `references/template-structure.md`):

#### 2 Cols + Image (1 image)

```json
"size": {"width": {"magnitude": 306.2, "unit": "PT"}, "height": {"magnitude": 280.0, "unit": "PT"}},
"transform": {"scaleX": 1, "scaleY": 1, "translateX": 382.0, "translateY": 95.6, "unit": "PT"}
```

#### 2 Blocks + Images (2 images)

Image 1 (left):
```json
"size": {"width": {"magnitude": 115.0, "unit": "PT"}, "height": {"magnitude": 105.2, "unit": "PT"}},
"transform": {"scaleX": 1, "scaleY": 1, "translateX": 124.4, "translateY": 98.9, "unit": "PT"}
```

Image 2 (right):
```json
"size": {"width": {"magnitude": 115.0, "unit": "PT"}, "height": {"magnitude": 105.2, "unit": "PT"}},
"transform": {"scaleX": 1, "scaleY": 1, "translateX": 480.5, "translateY": 98.9, "unit": "PT"}
```

#### 3 Img Composition (3 images)

Image 1 (left):
```json
"size": {"width": {"magnitude": 201.1, "unit": "PT"}, "height": {"magnitude": 230.0, "unit": "PT"}},
"transform": {"scaleX": 1, "scaleY": 1, "translateX": 25.7, "translateY": 95.6, "unit": "PT"}
```

Image 2 (center):
```json
"size": {"width": {"magnitude": 201.1, "unit": "PT"}, "height": {"magnitude": 230.0, "unit": "PT"}},
"transform": {"scaleX": 1, "scaleY": 1, "translateX": 259.9, "translateY": 95.6, "unit": "PT"}
```

Image 3 (right):
```json
"size": {"width": {"magnitude": 201.1, "unit": "PT"}, "height": {"magnitude": 230.0, "unit": "PT"}},
"transform": {"scaleX": 1, "scaleY": 1, "translateX": 494.1, "translateY": 95.6, "unit": "PT"}
```

#### Full Image (1 image, right half, full height)

```json
"size": {"width": {"magnitude": 302.0, "unit": "PT"}, "height": {"magnitude": 405.0, "unit": "PT"}},
"transform": {"scaleX": 1, "scaleY": 1, "translateX": 418.0, "translateY": 0.0, "unit": "PT"}
```

## Step 8: Visual Verification (MANDATORY)

After inserting all images, visually verify every slide that contains generated images. This step catches clipping, white borders, misalignment, and quality issues that are invisible from the API alone.

### 8.1 Get slide thumbnails

For each slide that has images, request a thumbnail using the Slides API:

```bash
CI=true gws slides presentations.pages getThumbnail \
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
- [ ] **No white borders:** The image blends seamlessly with the dark slide background (#222033) on all sides
- [ ] **Correct positioning:** The image is in the expected slot (left, right, center, full) without overlap on text elements
- [ ] **Text readability:** Any text within the generated image is legible at the thumbnail resolution
- [ ] **Visual quality:** The image looks clean and professional, not blurry or pixelated

### 8.4 Fix issues if found

If any check fails:

1. **Clipping:** The SVG content exceeds the viewBox. Regenerate the SVG with more padding (add 10-15% margin inside the viewBox) or simplify the content to fit.
2. **White borders:** The `<rect fill="#222033"/>` background is missing or doesn't cover the full viewBox. Fix the SVG and reconvert.
3. **Misalignment:** Delete the image and re-insert with corrected coordinates.
4. **Poor quality:** Reconvert using `--force-device-scale-factor=2` in Chrome for higher pixel density, or switch to cairosvg.

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
| Visual check: white borders | Missing background rect or Chrome margin | Verify `<rect fill="#222033"/>` is first SVG element; use HTML wrapper |
| Visual check: blurry/low quality | 1x rendering | Add `--force-device-scale-factor=2` to Chrome command |

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
