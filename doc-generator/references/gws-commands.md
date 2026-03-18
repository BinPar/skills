# GWS CLI Command Reference

Quick reference for Google Workspace CLI commands used by the doc-generator skill.

## Copy Template

```bash
gws drive files copy --params '{"fileId": "TEMPLATE_ID"}' --json '{"name": "Document Title", "parents": ["FOLDER_ID"]}'
```

Creates an exact copy of the template preserving all formatting. Returns JSON with the new document's `id`.

## Search Folders

```bash
gws drive files list --params '{"q": "name = '\''Folder Name'\'' and mimeType = '\''application/vnd.google-apps.folder'\''", "pageSize": 5}' --fields "files(id,name)"
```

Finds folders by name. Use the `id` from results as the `parents` value when copying.

## Read Document Structure

```bash
gws docs documents get --params '{"documentId": "DOC_ID"}'
```

Returns the full document JSON including all content elements with character indices, paragraph styles, text content, and table structures.

## Replace Content (batchUpdate)

```bash
gws docs documents batchUpdate --params '{"documentId": "DOC_ID"}' --json '{
  "requests": [
    {"deleteContentRange": {"range": {"startIndex": 100, "endIndex": 200}}},
    {"insertText": {"location": {"index": 100}, "text": "New content here"}}
  ]
}'
```

Process operations from **end to start** of document to keep indices valid. Delete text first, then insert at the same start position. Keep paragraph marks `\n` to preserve styling.

## Get Document URL

```bash
gws drive files get --params '{"fileId": "DOC_ID", "fields": "id,name,webViewLink"}'
```

Returns the document's web URL for sharing with the user.

## List Files (verification)

```bash
gws drive files list --params '{"pageSize": 3}'
```

Quick check that auth is working. Returns recent files.

## Common Flags

| Flag | Purpose |
|------|---------|
| `--params` | URL/query parameters as JSON |
| `--json` | Request body as JSON |
| `--fields` | Limit response fields (reduces output size) |
| `--dry-run` | Preview the request without executing (useful for debugging) |
