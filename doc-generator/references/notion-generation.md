# Notion Document Generation Reference

Reference for generating structured documents in Notion using the official Notion MCP server from either Claude Code or Codex.

## Runtime Compatibility

- Claude Code and Codex are both supported targets.
- Use the current runtime's official Notion MCP tools instead of assuming older REST-style tool names are present.
- Codex currently maps this workflow to `mcp__notion__notion_search`, `mcp__notion__notion_fetch`, `mcp__notion__notion_create_pages`, and `mcp__notion__notion_update_page`.
- In runtimes that expose a separate data source or collection concept, fetch the database first and create the page under the resolved data source target.

## Docs Database Schema

The "Docs" database in the Read Garden space has these properties:

| Property | Type | Expected Values |
|----------|------|-----------------|
| **Title** | title | Document title (e.g., "Propuesta de Desarrollo Web para ClienteX") |
| **Client** | select | Client name (e.g., "ClienteX", "Internal") |
| **Date** | date | ISO 8601 date (e.g., "2026-03-19") |
| **Author** | rich_text | Author's full name |
| **Document Type** | select | One of: `Proposal`, `Report`, `Specification`, `Plan` |

When creating a page, populate these logical fields using the current runtime's property format:

- Parent target: Docs database or resolved data source
- Icon: document-type emoji
- `Title`: document title
- `Client`: client name
- `Date`: ISO 8601 date
- `Author`: author full name
- `Document Type`: Proposal, Report, Specification, or Plan

## Page Icons by Document Type

| Document Type | Emoji | Rationale |
|---------------|-------|-----------|
| Proposal | 🤝 | Handshake — partnership, deal |
| Report | 📊 | Chart — data, analysis |
| Specification | 🔧 | Wrench — technical, building |
| Plan | 📅 | Calendar — planning, timeline |

## Content Building Blocks

Build the document using these Notion concepts, regardless of whether the runtime expresses them as Markdown or block payloads:

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

### Recommended authoring shape

In Codex, prefer Notion-flavored Markdown content in a single page creation call when practical. In Claude Code, use the equivalent current create/update content flow exposed by the runtime.

Equivalent logical structure:

```md
# Resumen Ejecutivo

> Idea clave o callout inicial.

## Contexto

Parrafo descriptivo.

## Alcance

- Punto 1
- Punto 2

## Tabla de datos

| Columna 1 | Columna 2 | Columna 3 |
| --- | --- | --- |
| A | B | C |
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

Search for the Docs database, then fetch the winning result to confirm the correct creation target.

```
Codex example search:
Tool: mcp__notion__notion_search
Arguments: { "query": "Docs", "query_type": "internal", "page_size": 10 }

Codex follow-up:
Tool: mcp__notion__notion_fetch
Arguments: { "id": "<database or page id/url>" }
```

### Create a page in the database

Use the current runtime's page creation tool with the fetched database or data source target and properties matching the schema.

Codex example:

```
Tool: mcp__notion__notion_create_pages
Parent: { "data_source_id": "<fetched data source id>" }
Properties: Title, Client, Date, Author, Document Type
Content: Notion-flavored Markdown
```

### Update or append content if needed

Prefer a single create call with full content when supported. If the runtime requires a second step, update the page content in top-to-bottom sections using its current page update tool.

For large documents, split into multiple updates:
1. First call: heading_1 + intro paragraphs for section 1
2. Second call: section 2 content
3. Continue as needed

### Get the page URL

After creating the page, present the returned page URL. If the runtime does not return it directly, fetch the page and surface the canonical URL.

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
