# BinPar Skills

Shared BinPar skills for team workflows in both Claude Code and Codex. The skills auto-detect intent and integrate with Google Workspace via the GWS CLI and Notion via the official Notion MCP server.

## Available Skills


| Skill                     | Description                                                                      | Example Triggers                                                                  |
| ------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `binpar-brand-design-system` | BinPar brand design system: colors, typography, logos, dark theme, UI tokens and landing patterns (from bi-productive) | "Aplica la marca BinPar", "colores de BinPar", "BinPar design tokens", "logo BinPar", "UI estilo BinPar" |
| `binpar-setup`            | Installs and configures Google Workspace CLI + Notion MCP                        | "Set up BinPar tools", "install gws", "configure notion"                          |
| `doc-generator`           | Generates documents in Google Docs or Notion                                     | "Crea una propuesta para...", "genera un documento", "create in Notion"           |
| `email-sender`            | Composes, drafts, replies to, and sends Gmail messages via `gws`                 | "send email", "envia un correo", "reply to this thread"                           |
| `slides-generator`        | Creates branded BinPar Google Slides presentations with generated visuals        | "Crea una presentación", "genera slides", "make a pitch deck"                     |
| `slides-generator-sermas` | Creates institutional Google Slides decks using the Sermas / Comunidad de Madrid — Consejería de Digitalización template | "Crea una presentación sermas", "deck sermas", "presentación comunidad de madrid", "madrid salud digital slides" |
| `docs-generator-sermas`   | Generates Sermas / DGSD Word documents (Google Docs) from the 4 official templates: DPE (alcance funcional), OP_GEN (genérico), OP_ACR (acta) and OC_MAN (manual multi-perfil) | "DPE sermas", "alcance funcional", "acta sermas", "manual de usuario sermas", "documento genérico sermas", "OC_DPE", "OP_ACR", "OP_GEN", "OC_MAN" |


## Quick Start

```bash
npx skills add BinPar/skills
```

This installs the skills for all supported agents on the machine. If you only want the current agent, run `npx skills add BinPar/skills`.

Then in Claude Code or Codex:

```
> "Set up BinPar tools"
```

This triggers `binpar-setup`, which guides you through GWS CLI installation, Google authentication, and optional Notion MCP setup.

### Manual Installation

If you prefer to install manually:

```bash
git clone git@github.com:BinPar/skills.git ~/dev/binpar-skills
ln -s ~/dev/binpar-skills/binpar-setup ~/.claude/skills/binpar-setup
ln -s ~/dev/binpar-skills/doc-generator ~/.claude/skills/doc-generator
ln -s ~/dev/binpar-skills/email-sender ~/.claude/skills/email-sender
ln -s ~/dev/binpar-skills/slides-generator ~/.claude/skills/slides-generator
ln -s ~/dev/binpar-skills/slides-generator-sermas ~/.claude/skills/slides-generator-sermas
ln -s ~/dev/binpar-skills/docs-generator-sermas ~/.claude/skills/docs-generator-sermas

ln -s ~/dev/binpar-skills/binpar-setup ~/.codex/skills/binpar-setup
ln -s ~/dev/binpar-skills/doc-generator ~/.codex/skills/doc-generator
ln -s ~/dev/binpar-skills/email-sender ~/.codex/skills/email-sender
ln -s ~/dev/binpar-skills/slides-generator ~/.codex/skills/slides-generator
ln -s ~/dev/binpar-skills/slides-generator-sermas ~/.codex/skills/slides-generator-sermas
ln -s ~/dev/binpar-skills/docs-generator-sermas ~/.codex/skills/docs-generator-sermas
```

## Prerequisites

- **Node.js 18+** — required by GWS CLI and Notion MCP server
- **Google Workspace account** — BinPar corporate account
- **Notion account** — with access to the Read Garden space (OAuth-based, no manual tokens)
- **Claude Code or Codex** — with skills support

## How It Works

### Google Workspace CLI

All Google Workspace integration uses the [GWS CLI](https://github.com/nichochar/gws-cli) (`@googleworkspace/cli`), a terminal CLI built by Google for AI agents. The current agent calls `gws` commands via Bash and gets structured JSON responses.

Key benefits:

- One-command setup: `gws auth setup`
- 93+ built-in agent skills covering Docs, Drive, Sheets, Gmail, Calendar, Slides
- JSON-first output designed for AI/agent consumption
- Credentials encrypted with AES-256-GCM in OS keyring

### Notion MCP Server

Internal document generation uses Notion's official hosted MCP server at `https://mcp.notion.com/mcp`. Claude Code and Codex both interact with Notion pages and databases via MCP tool calls.

Key benefits:

- Official Notion integration via Model Context Protocol (hosted by Notion)
- OAuth-based authentication (browser flow, no manual tokens)
- Direct page and database creation/editing
- Structured content with rich block types
- Scoped access via OAuth consent (connected only to Read Garden)

### Document Generation

The `doc-generator` skill supports two output backends:

**Google Docs** (client-facing, polished):

1. Copies BinPar's corporate template (preserves all formatting)
2. Reads the document structure via API (character indices, styles)
3. Maps content blocks using the structural reference
4. Replaces lorem ipsum text with generated content (end-to-start to preserve indices)
5. Result: professionally formatted document matching the template exactly

**Notion** (internal, simpler):

1. Locates the "Docs" database in the Read Garden space
2. Fetches the target database or data source details required by the current runtime
3. Creates a new page with metadata properties (Client, Date, Author, Type) and structured content
4. Result: well-organized Notion page in the team's Docs database

### Presentation Generation

Two skills generate Google Slides decks from BinPar-maintained templates. They share the same pipeline (copy template → plan → duplicate layout slides → optional parallel SVG subagents → convert/upload/insert images → fill text → return URL) but target different audiences and templates.

**`slides-generator` — BinPar pitch decks (client-facing):**

1. Copies the BinPar branded template (dark purple background, orange accents, Poppins/Roboto fonts)
2. Autonomously plans slide count, layout selection, and visual strategy
3. Duplicates needed layout slides from the template catalog, deletes unused ones
4. Spawns parallel subagents to generate SVG visuals (diagrams, charts, illustrations)
5. Converts SVGs to PNG, uploads to Drive, inserts into slides at precise coordinates
6. Fills text content, generates TOC, and returns the presentation URL

**`slides-generator-sermas` — Sermas / Comunidad de Madrid institutional decks:**

1. Copies the Sermas template (white background, `#2F5597` blue accent, Calibri/Arial, Comunidad de Madrid logo inherited from layout)
2. Follows a fixed, text-forward slide sequence: cover → TOC (capped at 8 sections) → content slides → optional ANEXO divider → immutable GRACIAS closing
3. Duplicates the single reusable content layout (`p3`) per section — single-column only, no two-column / big-number / cards variants
4. SVG visuals are optional (most Sermas decks are text-only); when used, the same subagent pipeline applies with Sermas brand kit
5. Applies canonical text styles after each insert (mandatory — `deleteText` + `insertText` leaves runs in an inconsistent state; numeral, title, body, and TOC slots each have a required `updateTextStyle` reset)
6. Returns the presentation URL in Spanish by default

Key differences between the two skills:

| Dimension | `slides-generator` (BinPar) | `slides-generator-sermas` |
|-----------|-----------------------------|---------------------------|
| Audience  | Clients, pitches, proposals | Public sector, healthcare, Madrid regional government |
| Aesthetic | Dark, visual-first, pitch   | White, text-forward, institutional |
| Layouts   | Multiple (columns, cards, big numbers, hero) | Single content layout |
| TOC       | Flexible                    | Hard cap of 8 sections |
| Visuals   | Default: yes                | Default: no (opt-in) |
| Closing   | Contact card                | Fixed "GRACIAS" slide (immutable) |

### Sermas Docs Generation

**`docs-generator-sermas`** is a umbrella skill for the 4 official Sermas (Comunidad de Madrid — DGSD) Word document templates, routed by intent:

1. **OC_DPE** — Documento de Petición / Alcance Funcional. "Living doc" per project: the Sermas gestor pre-fills the cover + metadata tables, and the skill only touches the editable sections (§1 Introducción, §2 Requisitos, §3 Descripción Funcional). Supports override of the canon template ID when the user passes a project-specific DPE URL.
2. **OP_GEN** — Documento genérico. 100% free body structure (the user dictates H1/H2/H3 chapters); the skill fills the cover, Hoja de Control, and replaces the placeholder chapters with real content.
3. **OP_ACR** — Acta de Reunión. Three structured tables (asistentes, resoluciones, próximos pasos) populated from a list-of-dicts input; header + footer carry additional placeholders (`<CODIGO PROYECTO>` without accent, `[Nombre del Proyecto]` with brackets, `<Departamento que realiza el documento >` with trailing space — all covered by the skill).
4. **OC_MAN** — Manual de Usuario multi-perfil. Generates **N documents in one execution** (one per user profile), with 5 common sections + 3 profile-specific sections (Guía de utilización, Preguntas frecuentes, Posibles incidencias).

All 4 flows share a **create vs update mode**:

- **Create**: copies the canon Google Doc template, runs `replaceAllText` on cover + header + footer, rewrites the editable body sections via `deleteContentRange` + `insertText` (end-to-start by index), and populates the first row of "Control de cambios".
- **Update**: accepts a Google Doc URL/ID, detects the document type by heading structure, rewrites only the sections the user specifies, and bumps the Hoja de Control (`+0.01` by default) with a new row describing the change.

Hard-won quirks encoded in the references (via end-to-end test runs):

- Never mix `deleteContentRange` inside table cells with `deleteTableRow` in the same batch — the API collapses unintended rows. Always separate batches with a re-read in between.
- Row deletions of empty template rows should happen **before** populating data rows; otherwise the first deletion occasionally wipes freshly inserted data.
- `deleteContentRange` + `insertText` inherits the `namedStyleType` of the deleted paragraph. Replacing a `HEADING_1` with body prose requires a follow-up `updateParagraphStyle` to `NORMAL_TEXT`.
- Placeholders live in **three segments** — `body`, `headers`, and `footers`. Scanning only the body leaves placeholders like `<Equipo que realiza el documento>` in the final deliverable.
- Two placeholder syntaxes coexist: `<...>` (most) and `[...]` (ACR header `kix.hf3`). Both must be covered.

Output is **always a Google Doc** (no `.docx` export) — the user exports manually when delivering to the client.

## Adding New Skills

Each skill is a directory with:

```
skill-name/
├── SKILL.md              # Main skill file (frontmatter + instructions)
└── references/           # Supporting docs the skill can read
    └── *.md
```

**SKILL.md frontmatter:**

```yaml
---
name: skill-name
description: >
  When to trigger this skill. Be specific about intent signals.
---
```

To install a new skill:

```bash
npx skills add /absolute/path/to/repo --skill skill-name --all
```

If you need a manual symlink instead, link the skill into the matching agent directory under `~/.claude/skills/` or `~/.codex/skills/`.

## Troubleshooting


| Issue                        | Solution                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `gws: command not found`     | Run `npm install -g @googleworkspace/cli` or ask the current agent: "Set up BinPar tools"                               |
| Auth expired                 | Run `gws auth login`                                                                                                    |
| Node.js too old              | Upgrade to Node.js 18+                                                                                                  |
| Permission denied on symlink | Check the target agent directory (`~/.claude/skills/` or `~/.codex/skills/`) exists and is writable                     |
| Template not accessible      | Verify Google Drive sharing permissions on the template document                                                        |
| Notion MCP not starting      | Re-check server registration with `claude mcp list` or `codex mcp list`, then re-add the server for the current runtime |
| Notion: no access to pages   | Re-authorize OAuth and select Read Garden during consent                                                                |
| Notion: auth expired         | Remove the current runtime's `notion` server, clear `~/.mcp-auth/` if needed, then re-add and re-authenticate           |


## Team Onboarding Checklist

1. Clone this repo
2. Install the skills with `npx skills add BinPar/skills --all`
3. Ask Claude Code or Codex: "Set up BinPar tools" (installs GWS CLI + authenticates + configures Notion)
4. Verify Google: `gws drive files list --params '{"pageSize": 1}'`
5. Verify Notion: re-open the current agent session and ask "verify Notion connection"
6. Test Google Docs: "Crea un documento de prueba"
7. Test Notion: "Crea un documento interno en Notion"

