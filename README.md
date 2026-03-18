# BinPar Skills

Claude Code skills collection for BinPar team workflows. These skills auto-detect intent and integrate with Google Workspace via the GWS CLI.

## Available Skills


| Skill           | Description                                            | Example Triggers                                                      |
| --------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| `binpar-setup`  | Installs and configures Google Workspace CLI           | "Set up BinPar tools", "install gws", "gws not found"                 |
| `doc-generator` | Generates Google Docs from BinPar's corporate template | "Crea una propuesta para...", "genera un documento", "draft a report" |


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

- **Node.js 18+** — required by GWS CLI
- **Google Workspace account** — BinPar corporate account
- **Claude Code** — with skills support

## How It Works

### Google Workspace CLI

All Google Workspace integration uses the [GWS CLI](https://github.com/nichochar/gws-cli) (`@googleworkspace/cli`), a terminal CLI built by Google for AI agents. Claude calls `gws` commands via Bash and gets structured JSON responses.

Key benefits:

- One-command setup: `gws auth setup`
- 93+ built-in agent skills covering Docs, Drive, Sheets, Gmail, Calendar, Slides
- JSON-first output designed for AI/agent consumption
- Credentials encrypted with AES-256-GCM in OS keyring

### Document Generation

The `doc-generator` skill uses a **Read-Map-Replace** strategy:

1. Copies BinPar's corporate template (preserves all formatting)
2. Reads the document structure via API (character indices, styles)
3. Maps content blocks using the structural reference
4. Replaces lorem ipsum text with generated content (end-to-start to preserve indices)
5. Result: professionally formatted document matching the template exactly

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


## Team Onboarding Checklist

1. Clone this repo
2. Symlink skills into `~/.claude/skills/`
3. Ask Claude: "Set up BinPar tools" (installs GWS CLI + authenticates)
4. Verify: `gws drive files list --params '{"pageSize": 1}'`
5. Test: "Crea un documento de prueba"

