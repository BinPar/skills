# Template Structure Map

> **Status:** PENDING — This file will be populated after reading the template document via the GWS CLI API.

## Template Document

- **Reference Document ID:** `1OUFhlHXLCkIZRhel6NvOkL9mqNSTXmUAMmz27nAFahU`
- **Actual Template ID:** TBD — to be found from Google Docs template gallery

## How to Populate This File

1. Ensure GWS CLI is installed and authenticated
2. Read the document structure:
   ```bash
   gws docs documents get --params '{"documentId": "1OUFhlHXLCkIZRhel6NvOkL9mqNSTXmUAMmz27nAFahU"}'
   ```
3. Map every content element: type, position, purpose, and what content should replace it
4. Document the heading hierarchy, table structure, cover page layout, and footer

## Expected Structure

Based on the BinPar corporate template, this file will document:

### Cover Page Elements
- Title (large, styled heading)
- Subtitle / tagline
- Abstract / executive summary
- Date
- Author / team

### Heading Hierarchy
- `HEADING_1` — Main sections
- `HEADING_2` — Subsections
- `HEADING_3` — Sub-subsections

### Content Blocks
For each section between headings:
- Element type (NORMAL_TEXT, TABLE, etc.)
- Start and end index ranges (approximate — must re-read for exact indices)
- Purpose / what kind of content should replace it
- Whether it's a heading (rename) or body text (replace)

### Tables
- Table positions and dimensions
- Cell purposes (e.g., timeline, features, pricing)
- Which cells to replace and with what type of content

### Footer
- Date position
- Author position

### Styling Notes
- Fonts used per section type
- Colors (BinPar brand colors)
- Spacing and margins

## Element Identification from API Response

The `gws docs documents get` response contains a `body.content` array. Each element has:
```json
{
  "startIndex": 123,
  "endIndex": 456,
  "paragraph": {
    "paragraphStyle": {
      "namedStyleType": "HEADING_1"
    },
    "elements": [
      {
        "startIndex": 123,
        "endIndex": 455,
        "textRun": {
          "content": "Section Title Text\n",
          "textStyle": { ... }
        }
      }
    ]
  }
}
```

Key fields for mapping:
- `namedStyleType` — identifies heading level vs body text
- `startIndex` / `endIndex` — character positions for batchUpdate
- `textRun.content` — current text (lorem ipsum to be replaced)
- `table` — present for table elements, contains rows and cells
