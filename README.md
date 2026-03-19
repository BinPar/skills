# BinPar Skills

Claude Code skills collection for BinPar team workflows. These skills auto-detect intent and integrate with Google Workspace via the GWS CLI and Notion via the official Notion MCP server.

## Available Skills


| Skill           | Description                                                        | Example Triggers                                                      |
| --------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `binpar-setup`  | Installs and configures Google Workspace CLI + Notion MCP          | "Set up BinPar tools", "install gws", "configure notion"              |
| `doc-generator` | Generates documents in Google Docs or Notion                       | "Crea una propuesta para...", "genera un documento", "create in Notion" |


## Quick Start

```bash
npx skills add BinPar/skills
```

That's it — all BinPar skills are installed. Then in Claude Code:

```
> "Set up BinPar tools"
```

This triggers `binpar-setup`, which guides you through GWS CLI installation and Google authentication.

### Manual Installation

If you prefer to install manually:

```bash
git clone git@github.com:BinPar/skills.git ~/dev/binpar-skills
ln -s ~/dev/binpar-skills/binpar-setup ~/.claude/skills/binpar-setup
ln -s ~/dev/binpar-skills/doc-generator ~/.claude/skills/doc-generator
```

## Prerequisites

- **Node.js 18+** — required by GWS CLI and Notion MCP server
- **Google Workspace account** — BinPar corporate account
- **Notion account** — with access to the Read Garden space (OAuth-based, no manual tokens)
- **Claude Code** — with skills support

## How It Works

### Google Workspace CLI

All Google Workspace integration uses the [GWS CLI](https://github.com/nichochar/gws-cli) (`@googleworkspace/cli`), a terminal CLI built by Google for AI agents. Claude calls `gws` commands via Bash and gets structured JSON responses.

Key benefits:

- One-command setup: `gws auth setup`
- 93+ built-in agent skills covering Docs, Drive, Sheets, Gmail, Calendar, Slides
- JSON-first output designed for AI/agent consumption
- Credentials encrypted with AES-256-GCM in OS keyring

### Notion MCP Server

Internal document generation uses Notion's official hosted MCP server at `https://mcp.notion.com/mcp`. Claude interacts with Notion pages and databases via MCP tool calls.

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
2. Creates a new page with metadata properties (Client, Date, Author, Type)
3. Appends structured content blocks (headings, paragraphs, tables, callouts)
4. Result: well-organized Notion page in the team's Docs database

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
ln -s ~/dev/binpar-skills/skill-name ~/.claude/skills/skill-name
```

## Troubleshooting


| Issue                        | Solution                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `gws: command not found`     | Run `npm install -g @googleworkspace/cli` or ask Claude: "Set up BinPar tools" |
| Auth expired                 | Run `gws auth login`                                                           |
| Node.js too old              | Upgrade to Node.js 18+                                                         |
| Permission denied on symlink | Check `~/.claude/skills/` exists and is writable                               |
| Template not accessible      | Verify Google Drive sharing permissions on the template document               |
| Notion MCP not starting      | Run `/mcp` in Claude Code, or re-add: `claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp` |
| Notion: no access to pages   | Re-authorize OAuth and select Read Garden during consent                       |
| Notion: auth expired         | Run `/mcp` to re-authenticate, or `claude mcp remove notion` then re-add       |


## Team Onboarding Checklist

1. Clone this repo
2. Symlink skills into `~/.claude/skills/`
3. Ask Claude: "Set up BinPar tools" (installs GWS CLI + authenticates + configures Notion)
4. Verify Google: `gws drive files list --params '{"pageSize": 1}'`
5. Verify Notion: restart Claude Code and ask "verify Notion connection"
6. Test Google Docs: "Crea un documento de prueba"
7. Test Notion: "Crea un documento interno en Notion"

