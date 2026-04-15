# GWS CLI Commands for Slides

Quick reference for Google Workspace CLI commands used by the slides-generator-sermas skill.

**IMPORTANT:** All `gws` commands MUST be prefixed with `CI=true` to disable the TUI and get plain JSON output.

## Copy Template

```bash
CI=true gws drive files copy \
  --params '{"fileId": "1shVwhiGRIgLml3TB9SUMsEW_OwS0HHDsuH2bb3MMaVc"}' \
  --json '{"name": "Presentation Title", "parents": ["FOLDER_ID"]}'
```

Creates an exact copy of the template preserving all slides, formatting, and elements. Returns JSON with the new presentation's `id`.

## Search Folders

```bash
CI=true gws drive files list \
  --params '{"q": "name = '\''Folder Name'\'' and mimeType = '\''application/vnd.google-apps.folder'\''", "pageSize": 5}'
```

Finds folders by name. Use the `id` from results as the `parents` value when copying.

## Read Presentation Structure

```bash
CI=true gws slides presentations get --params '{"presentationId": "PRES_ID"}'
```

Returns the full presentation JSON including:
- `slides[]` — array of slide objects
- `slides[].objectId` — slide's unique ID
- `slides[].pageElements[]` — shapes, text boxes, images on the slide
- `slides[].slideProperties.layoutObjectId` — which layout this slide uses
- `slides[].slideProperties.notesPage` — speaker notes page with its own elements
- `layouts[]` — available layout definitions
- `masters[]` — master slide definitions
- `pageSize` — presentation dimensions

## Batch Update (All Mutations)

```bash
CI=true gws slides presentations batchUpdate \
  --params '{"presentationId": "PRES_ID"}' \
  --json '{"requests": [...]}'
```

All slide modifications go through batchUpdate. Multiple requests execute atomically in order. If any request fails, the entire batch is rejected.

**Batch sizing:** Keep batches under ~20 requests. Split into logical groups:
1. Structural operations (duplicate, reorder, delete slides)
2. Text operations (delete text, insert text, update styles)
3. Image operations (create images)

### Request Types

#### duplicateObject — Duplicate a slide

```json
{
  "duplicateObject": {
    "objectId": "SLIDE_OBJECT_ID"
  }
}
```

Creates a copy of the specified slide appended at the end of the presentation. The response includes the new slide's `objectId`. All element IDs on the new slide are system-generated — re-read the presentation to discover them.

#### deleteObject — Delete a slide or element

```json
{
  "deleteObject": {
    "objectId": "SLIDE_OR_ELEMENT_ID"
  }
}
```

Permanently removes a slide (if objectId is a slide) or a specific element (shape, image, etc.) from a slide.

#### updateSlidesPosition — Reorder slides

```json
{
  "updateSlidesPosition": {
    "slideObjectIds": ["SLIDE_1", "SLIDE_2", "SLIDE_3"],
    "insertionIndex": 0
  }
}
```

Moves the specified slides to the given position (0-indexed). Use this after duplicating slides to arrange them in the desired order.

#### replaceAllText — Find and replace text

```json
{
  "replaceAllText": {
    "containsText": {
      "text": "PLACEHOLDER_TEXT",
      "matchCase": true
    },
    "replaceText": "Actual content",
    "pageObjectIds": ["SLIDE_OBJECT_ID"]
  }
}
```

Replaces all occurrences of the search text. Use `pageObjectIds` to scope the replacement to specific slides — this is critical to avoid replacing text on other slides that share the same template placeholder.

#### deleteText — Delete text from a shape

```json
{
  "deleteText": {
    "objectId": "SHAPE_OBJECT_ID",
    "textRange": {
      "type": "ALL"
    }
  }
}
```

Deletes all text from the specified shape. Use `type: "ALL"` to clear the entire text content. Can also use `type: "FIXED_RANGE"` with `startIndex` and `endIndex` for partial deletion.

#### insertText — Insert text into a shape

```json
{
  "insertText": {
    "objectId": "SHAPE_OBJECT_ID",
    "insertionIndex": 0,
    "text": "New text content"
  }
}
```

Inserts text at the specified index within a shape. Use `insertionIndex: 0` after `deleteText` (type: ALL) to replace all content.

#### updateTextStyle — Modify text formatting

```json
{
  "updateTextStyle": {
    "objectId": "SHAPE_OBJECT_ID",
    "textRange": {
      "type": "ALL"
    },
    "style": {
      "fontSize": {"magnitude": 14, "unit": "PT"},
      "fontFamily": "Arial",
      "foregroundColor": {
        "opaqueColor": {
          "rgbColor": {"red": 0.184, "green": 0.333, "blue": 0.592}
        }
      },
      "bold": true
    },
    "fields": "fontSize,fontFamily,foregroundColor,bold"
  }
}
```

Updates text formatting. The `fields` mask specifies which properties to update. Most text styling is inherited from the template layout, so this is only needed for customization beyond defaults.

#### createImage — Insert an image

```json
{
  "createImage": {
    "url": "https://drive.google.com/uc?export=download&id=FILE_ID",
    "elementProperties": {
      "pageObjectId": "SLIDE_OBJECT_ID",
      "size": {
        "width": {"magnitude": 400.0, "unit": "PT"},
        "height": {"magnitude": 300.0, "unit": "PT"}
      },
      "transform": {
        "scaleX": 1,
        "scaleY": 1,
        "translateX": 50.0,
        "translateY": 150.0,
        "unit": "PT"
      }
    }
  }
}
```

Creates an image from a publicly accessible URL at the specified position and size on the target slide. The URL must be reachable by Google's servers — use Google Drive with public read permission.

#### createSlide — Create a slide from layout

```json
{
  "createSlide": {
    "slideLayoutReference": {
      "layoutId": "p9"
    },
    "insertionIndex": 2
  }
}
```

Creates a new slide from a master layout. For Sermas, the most useful layout is `p9` ("1_Title Only") — the one used by content slides p3–p6. Prefer `duplicateObject` over `createSlide` when possible, because duplicating preserves the template's styled placeholder text boxes.

Available predefined layouts (Google Slides built-ins): `TITLE`, `SECTION_HEADER`, `TITLE_AND_BODY`, `TITLE_AND_TWO_COLUMNS`, `TITLE_ONLY`, `ONE_COLUMN_TEXT`, `MAIN_POINT`, `SECTION_TITLE_AND_DESCRIPTION`, `CAPTION_ONLY`, `BIG_NUMBER`, `BLANK`. These do NOT inherit Sermas branding — use them only as a last resort and expect bare, unstyled slides.

## Get Page Thumbnail

```bash
CI=true gws slides presentations pages getThumbnail \
  --params '{"presentationId": "PRES_ID", "pageObjectId": "SLIDE_ID"}'
```

Returns a URL to a rendered thumbnail of the specified slide. Useful for verification. Counts as an expensive read request for API quota.

## Upload Image to Drive

```bash
CI=true gws drive files create \
  --upload ./slide_assets/image.png \
  --json '{"name": "image.png", "mimeType": "image/png", "parents": ["FOLDER_ID"]}' \
  --params '{"uploadType": "multipart"}'
```

Uploads a local file to Google Drive. The file MUST be in the working directory or a subdirectory (the `--upload` flag rejects absolute paths outside the working directory). Returns JSON with the file's `id`.

## Set File Public Permission

```bash
CI=true gws drive permissions create \
  --params '{"fileId": "FILE_ID"}' \
  --json '{"role": "reader", "type": "anyone"}'
```

Makes a Drive file publicly readable. Required before using the file's URL in `createImage` — Google Slides fetches the image from the URL at insertion time.

## Delete File from Drive

```bash
CI=true gws drive files delete --params '{"fileId": "FILE_ID"}'
```

Permanently deletes a file from Drive. Use after images have been inserted into the presentation to clean up temporary uploads.

## Get Presentation URL

```bash
CI=true gws drive files get --params '{"fileId": "PRES_ID", "fields": "id,name,webViewLink"}'
```

Returns the presentation's web URL for sharing with the user.

## Check Auth Status

```bash
CI=true gws auth status
```

Verifies current authentication. If expired, re-authenticate:

```bash
CI=true gws auth login
```

Extract and display the auth URL to the user in chat text.

## Common Flags

| Flag | Purpose |
|------|---------|
| `--params` | URL/query parameters as JSON |
| `--json` | Request body as JSON |
| `--upload` | Local file path for media upload |
| `--format json` | Output format (json is default) |
| `--dry-run` | Preview request without executing |
| `--fields` | Limit response fields |

## Common Pitfalls

| Issue | Cause | Solution |
|-------|-------|----------|
| `objectId not found` | Using template IDs after duplication | Re-read presentation to get fresh IDs |
| `createImage` returns 400 | Image URL not publicly accessible | Set `reader/anyone` permission first |
| `replaceAllText` hits wrong slides | No `pageObjectIds` filter | Always scope to specific slide IDs |
| Batch too large | >30 requests in one call | Split into batches of ~20 |
| Text styling lost | Deleted paragraph marks | Use `type: ALL` in deleteText, then insertText at index 0 — styling is inherited from the layout |
| Slides in wrong order | Duplication appends to end | Use `updateSlidesPosition` to reorder after all duplications |
| Upload fails | File path outside working directory | Move files to `./slide_assets/` before uploading |
