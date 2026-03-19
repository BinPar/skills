# Notion Document Generation Reference

Reference for generating structured documents in Notion using the Notion MCP server tools.

## Docs Database Schema

The "Docs" database in the Read Garden space has these properties:

| Property | Type | Expected Values |
|----------|------|-----------------|
| **Title** | title | Document title (e.g., "Propuesta de Desarrollo Web para ClienteX") |
| **Client** | select | Client name (e.g., "ClienteX", "Internal") |
| **Date** | date | ISO 8601 date (e.g., "2026-03-19") |
| **Author** | rich_text | Author's full name |
| **Document Type** | select | One of: `Proposal`, `Report`, `Specification`, `Plan` |

When creating a page, set properties like this:

```json
{
  "parent": { "database_id": "DATABASE_ID" },
  "icon": { "emoji": "🤝" },
  "properties": {
    "Title": {
      "title": [{ "text": { "content": "Document Title" } }]
    },
    "Client": {
      "select": { "name": "ClientName" }
    },
    "Date": {
      "date": { "start": "2026-03-19" }
    },
    "Author": {
      "rich_text": [{ "text": { "content": "Author Name" } }]
    },
    "Document Type": {
      "select": { "name": "Proposal" }
    }
  }
}
```

## Page Icons by Document Type

| Document Type | Emoji | Rationale |
|---------------|-------|-----------|
| Proposal | 🤝 | Handshake — partnership, deal |
| Report | 📊 | Chart — data, analysis |
| Specification | 🔧 | Wrench — technical, building |
| Plan | 📅 | Calendar — planning, timeline |

## Available Block Types

The Notion API supports these block types for content:

### Text Blocks

| Block Type | Use Case | Notion API type |
|------------|----------|-----------------|
| Heading 1 | Major sections | `heading_1` |
| Heading 2 | Subsections | `heading_2` |
| Heading 3 | Sub-subsections | `heading_3` |
| Paragraph | Body text | `paragraph` |
| Bulleted list | Key points, features | `bulleted_list_item` |
| Numbered list | Steps, ordered items | `numbered_list_item` |
| Quote | Highlighted quotes | `quote` |
| Callout | Important notes, CTAs | `callout` |
| Code | Technical snippets | `code` |
| Toggle | Collapsible sections | `toggle` |

### Structural Blocks

| Block Type | Use Case | Notion API type |
|------------|----------|-----------------|
| Divider | Section separator | `divider` |
| Table | Data comparisons | `table` |
| Table row | Row within table | `table_row` |

### Block JSON Format

Each block follows this structure:

```json
{
  "type": "heading_1",
  "heading_1": {
    "rich_text": [{ "text": { "content": "Section Title" } }]
  }
}
```

**Paragraph with formatting:**
```json
{
  "type": "paragraph",
  "paragraph": {
    "rich_text": [
      { "text": { "content": "Normal text " } },
      { "text": { "content": "bold text" }, "annotations": { "bold": true } },
      { "text": { "content": " and " } },
      { "text": { "content": "italic text" }, "annotations": { "italic": true } }
    ]
  }
}
```

**Callout:**
```json
{
  "type": "callout",
  "callout": {
    "icon": { "emoji": "💡" },
    "rich_text": [{ "text": { "content": "Important note or call to action" } }]
  }
}
```

**Divider:**
```json
{
  "type": "divider",
  "divider": {}
}
```

**Table (3 columns, 2 rows):**
```json
{
  "type": "table",
  "table": {
    "table_width": 3,
    "has_column_header": true,
    "children": [
      {
        "type": "table_row",
        "table_row": {
          "cells": [
            [{ "text": { "content": "Header 1" } }],
            [{ "text": { "content": "Header 2" } }],
            [{ "text": { "content": "Header 3" } }]
          ]
        }
      },
      {
        "type": "table_row",
        "table_row": {
          "cells": [
            [{ "text": { "content": "Cell 1" } }],
            [{ "text": { "content": "Cell 2" } }],
            [{ "text": { "content": "Cell 3" } }]
          ]
        }
      }
    ]
  }
}
```

## Content Mapping: Google Docs → Notion

How the Google Docs template sections translate to Notion blocks:

| Google Docs Element | Notion Equivalent |
|--------------------|--------------------|
| Cover page title (TITLE 60pt) | Page title property (set via database Title) |
| Cover subtitle | Paragraph with bold, or heading_2 at top |
| Abstract box (1x1 table) | Callout block with 💡 or 📋 icon |
| H1 heading | `heading_1` block |
| H2 heading | `heading_2` block |
| H3 heading | `heading_3` block |
| Body text (NORMAL_TEXT) | `paragraph` block |
| Bullet points | `bulleted_list_item` blocks |
| Data table | `table` block |
| Section separator | `divider` block |
| Footer (author/date) | Set via page properties (Author, Date) |
| Header (client/date) | Set via page properties (Client, Date) |
| Closing page (logo/URL) | Not needed — Notion pages don't need closing pages |

### What's NOT available in Notion

- Custom fonts (Poppins, Roboto) — Notion uses its own typography
- Positioned logos/images with text wrap
- Exact spacing control (line spacing, paragraph spacing)
- Cover page layout with colored backgrounds
- Page footers/headers in the Google Docs sense
- Custom font sizes (60pt title, etc.)

### What IS available in Notion

- Bold, italic, strikethrough, underline, code inline
- Text color and background color
- Links (inline)
- Page icon (emoji or custom image)
- Page cover image
- Database properties for metadata
- Rich block types (callouts, toggles, tables)

## Inline Text Formatting

Rich text annotations available:

```json
{
  "annotations": {
    "bold": true,
    "italic": false,
    "strikethrough": false,
    "underline": false,
    "code": false,
    "color": "default"
  }
}
```

Available colors: `default`, `gray`, `brown`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `red`, plus `*_background` variants (e.g., `gray_background`).

## MCP Tool Usage Patterns

### Find the Docs database

Use `mcp__notion__search` to find the database:

```
Tool: mcp__notion__search
Arguments: { "query": "Docs", "filter": { "property": "object", "value": "database" } }
```

### Create a page in the database

Use `mcp__notion__create_page` with the database as parent and properties matching the schema.

### Append content blocks

Use `mcp__notion__append_block_children` to add blocks to the page. The Notion API accepts up to 100 blocks per request.

For large documents, split into multiple append calls:
1. First call: heading_1 + intro paragraphs for section 1
2. Second call: section 2 content
3. Continue as needed

### Get the page URL

After creating the page, the response includes a `url` field with the Notion page URL.

## Page Structure Patterns

### Proposal

```
Page icon: 🤝
---
heading_1: Resumen Ejecutivo
  callout (💡): Brief executive summary
  paragraph: Context and opportunity description

heading_1: Propuesta de Solución
  heading_2: Alcance del Proyecto
    paragraph: Scope description
    bulleted_list_item: Feature 1
    bulleted_list_item: Feature 2
  heading_2: Tecnologías
    paragraph: Tech stack description
  heading_2: Metodología
    paragraph: Development approach

heading_1: Cronograma y Presupuesto
  heading_2: Fases del Proyecto
    table: Phase | Duration | Deliverables
  heading_2: Inversión
    paragraph: Budget details
    table: Item | Cost
  heading_2: Condiciones de Pago
    numbered_list_item: Payment milestone 1
    numbered_list_item: Payment milestone 2

divider

callout (📩): Siguiente paso — call to action
```

### Report

```
Page icon: 📊
---
heading_1: Resumen
  callout (📋): Key findings summary
  paragraph: Report context

heading_1: Análisis
  heading_2: Topic 1
    paragraph: Analysis
    table: Data comparison
  heading_2: Topic 2
    paragraph: Analysis
    bulleted_list_item: Finding 1
    bulleted_list_item: Finding 2

heading_1: Conclusiones
  paragraph: Summary of findings
  heading_2: Recomendaciones
    numbered_list_item: Recommendation 1
    numbered_list_item: Recommendation 2

divider

callout (📩): Next steps
```

### Specification

```
Page icon: 🔧
---
heading_1: Visión General
  paragraph: System overview
  callout (🎯): Goals and objectives

heading_1: Requisitos
  heading_2: Requisitos Funcionales
    numbered_list_item: FR-1 Description
    numbered_list_item: FR-2 Description
  heading_2: Requisitos No Funcionales
    bulleted_list_item: Performance requirements
    bulleted_list_item: Security requirements

heading_1: Arquitectura
  heading_2: Componentes
    paragraph: Architecture description
    table: Component | Responsibility | Technology
  heading_2: Integraciones
    paragraph: Integration points

heading_1: Plan de Implementación
  table: Phase | Tasks | Duration

divider

callout (📝): Notes and constraints
```

### Plan

```
Page icon: 📅
---
heading_1: Objetivo
  callout (🎯): Main objective statement
  paragraph: Context and motivation

heading_1: Plan de Acción
  heading_2: Fase 1 — Name
    paragraph: Description
    bulleted_list_item: Task 1
    bulleted_list_item: Task 2
  heading_2: Fase 2 — Name
    paragraph: Description
    bulleted_list_item: Task 1

heading_1: Cronograma
  table: Phase | Start | End | Owner

heading_1: Recursos y Riesgos
  heading_2: Recursos Necesarios
    bulleted_list_item: Resource 1
  heading_2: Riesgos Identificados
    table: Risk | Impact | Mitigation

divider

callout (✅): Success criteria
```
