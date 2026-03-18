---
name: doc-generator
description: >
  Use this skill when the user asks to generate a document, create a proposal,
  draft a report, create a Google Doc, write a project specification, generate
  a BinPar document, or describes content that should be produced as a formatted
  Google Docs document. Also triggers when the user mentions creating deliverables,
  writing client-facing documents, or needs a professionally formatted document.
  Default language: Spanish. Auto-detect intent even when users don't explicitly
  ask for document generation.
---

# BinPar Document Generator

Generates Google Docs by copying BinPar's corporate template and intelligently replacing content while preserving all styling and formatting.

## Prerequisites Check

Before starting, verify GWS CLI is available:

```bash
which gws
```

If `gws` is not found, tell the user:
> "GWS CLI is not installed. Ask me to 'Set up BinPar tools' to install and configure it."

Then stop — do not proceed without GWS CLI.

Quick auth check:
```bash
gws auth status
```

If auth is expired, guide re-authentication:
```bash
gws auth login
```

## Template Information

- **Template Document ID:** `1OUFhlHXLCkIZRhel6NvOkL9mqNSTXmUAMmz27nAFahU`
- **Structural map:** Read `references/template-structure.md` for the complete element mapping

> **Note:** The template ID above is the reference document created from the BinPar template.
> Once the actual template gallery ID is found, update this value.

## Document Generation Workflow

### Step A — Extract Information from User's Description

Parse the user's request to identify:
- **Document type:** proposal, report, specification, plan, etc.
- **Title:** main document title
- **Subtitle:** secondary title or tagline (if applicable)
- **Client name:** who the document is for
- **Author:** who is writing it (default: ask or use authenticated user)
- **Content points:** key topics, features, requirements the user mentioned
- **Date:** default to today in Spanish format (e.g., "Marzo de 2026")
- **Language:** default Spanish; adapt if user writes in another language

**Content tone based on document type:**
- Proposal → persuasive, benefit-focused
- Report → analytical, data-driven
- Specification → technical, precise
- Plan → structured, actionable

Ask for clarification only if critical information is genuinely ambiguous. Infer reasonable defaults for everything else.

### Step B — Ask for Destination Folder

Ask the user where to save the document in Google Drive.

If they provide a **URL**, extract the folder ID:
```
https://drive.google.com/drive/folders/{FOLDER_ID}
```

If they provide a **folder name**, search for it:
```bash
gws drive files list --params '{"q": "name = '\''Folder Name'\'' and mimeType = '\''application/vnd.google-apps.folder'\''", "pageSize": 5}' --fields "files(id,name)"
```

If multiple matches, show them and ask the user to pick.

If they don't care, create the document in Drive root (omit `parents` from the copy command).

### Step C — Copy the Template

```bash
gws drive files copy --params '{"fileId": "TEMPLATE_ID"}' --json '{"name": "DOCUMENT_TITLE", "parents": ["FOLDER_ID"]}'
```

This creates an exact copy preserving all formatting, colors, fonts, styles, headers, footers, and page layout. The response returns the new document ID.

If no folder was specified, omit the `parents` field:
```bash
gws drive files copy --params '{"fileId": "TEMPLATE_ID"}' --json '{"name": "DOCUMENT_TITLE"}'
```

### Step D — Read the Document Structure

```bash
gws docs documents get --params '{"documentId": "NEW_DOC_ID"}'
```

This returns the full document JSON with every element's:
- Character indices (startIndex, endIndex)
- Paragraph styles (HEADING_1, HEADING_2, HEADING_3, NORMAL_TEXT)
- Text content
- Table structure and cell content

Parse this JSON and cross-reference with the structural map in `references/template-structure.md` to identify all content blocks that need replacement.

### Step E — Generate Content for Each Section

Based on the structural map and the user's description, generate content for:

1. **Cover page:** title, subtitle, executive summary/abstract
2. **Section bodies:** content matched to each section's purpose, informed by the user's description
3. **Tables:** populated with relevant data (project timelines, feature lists, pricing, etc.)
4. **Footer:** updated date and author name

**Content generation guidelines:**
- Professional, well-structured Spanish by default
- Match tone to document type (see Step A)
- Keep sections proportional to their importance
- Use formal "usted" for client-facing documents
- Use concrete details from the user's description — avoid generic filler
- Populate tables with realistic, relevant data
- Each section should flow logically into the next

### Step F — Replace Content via batchUpdate

Build a `batchUpdate` request that processes replacements **from END to START** of the document. This is critical — processing in reverse order ensures character indices remain valid as content length changes.

For each content block to replace:

1. **Delete** the lorem ipsum text (keep the paragraph mark `\n` to preserve styling):
   ```json
   {"deleteContentRange": {"range": {"startIndex": START, "endIndex": END}}}
   ```

2. **Insert** new text at the cleared position (inherits existing paragraph formatting):
   ```json
   {"insertText": {"location": {"index": START}, "text": "New content here"}}
   ```

Execute the batch:
```bash
gws docs documents batchUpdate --params '{"documentId": "NEW_DOC_ID"}' --json '{
  "requests": [
    {"deleteContentRange": {"range": {"startIndex": LAST_SECTION_START, "endIndex": LAST_SECTION_END}}},
    {"insertText": {"location": {"index": LAST_SECTION_START}, "text": "Content for last section"}},
    ...
    {"deleteContentRange": {"range": {"startIndex": FIRST_SECTION_START, "endIndex": FIRST_SECTION_END}}},
    {"insertText": {"location": {"index": FIRST_SECTION_START}, "text": "Content for first section"}}
  ]
}'
```

**Important rules:**
- Process sections from END to START (highest indices first)
- Delete body text only — keep paragraph marks `\n` to preserve formatting
- For headings that need renaming: delete heading text + insert new heading text
- For tables: replace cell content individually
- New text inherits the paragraph's existing formatting (font, size, color, spacing)
- If the batch is large, split into multiple batchUpdate calls (still end-to-start within each)

### Step G — Get Document URL and Present Result

```bash
gws drive files get --params '{"fileId": "NEW_DOC_ID", "fields": "id,name,webViewLink"}'
```

Present to the user:
- The document URL (webViewLink)
- Brief summary of what was generated (title, number of sections, key content areas)
- Remind them to review and adjust as needed

## Error Handling

| Error | Solution |
|-------|----------|
| `gws` not found | Tell user: "Ask me to 'Set up BinPar tools'" |
| Auth expired | Run `gws auth login` |
| Template not accessible | Check sharing permissions; verify template ID is correct |
| batchUpdate index error | Re-read document structure; indices may have shifted from a prior edit |
| Rate limit | Wait a moment, retry the failed command |
| Large document timeout | Split batchUpdate into smaller batches |

If a batchUpdate fails, re-read the document structure (Step D) to get fresh indices before retrying.
