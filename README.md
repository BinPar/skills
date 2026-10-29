# BinPar Skills

Agent skills for Claude Code and Codex with BinPar's identity: how the brand looks, how it
talks and how its documents are produced. BinPar is a single-product company (institutional
medical AI, formerly Consensus Salutis), so these skills cover both company and product.

| Skill | What it does | Typical triggers |
|---|---|---|
| [`binpar-brand-design-system`](skills/binpar-brand-design-system/SKILL.md) | Visual identity from the manual v1.0: logo and app tile, teal/navy palette with light and dark themes, Sora + Plus Jakarta Sans, 44 px grid, isometric planes, surfaces, flaps, pill components, motion, charts. Ships CSS tokens, Tailwind theme, fonts, logos, favicons and an HTML starter | "Hazme una landing / artifact / dashboard de BinPar", "colores de BinPar", "revisa si esto cumple la marca", "OG image para LinkedIn" |
| [`binpar-brand-voice`](skills/binpar-brand-voice/SKILL.md) | How BinPar writes (es-ES): clinical sobriety, naming, no personified AI, clinical and regulatory red lines, disclosure boundary, corporate register, guidance per format (proposal, report, deck, email, UI, blog) and a review mode | "Redacta la propuesta", "revisa este texto", "escribe el post", "copy del botón" |
| [`binpar-documents`](skills/binpar-documents/SKILL.md) | Branded A4 PDFs, locally: Markdown → cover, index with page numbers, chapters, tables, callouts, KPIs, charts, back cover; or free-layout HTML (one-pagers) printed with the brand CSS. Node 22 + Chrome, no npm installs | "Genera el PDF de la propuesta", "pásalo a PDF con la marca", "haz una ficha de producto" |

Other formats (decks, sites, dashboards) are built as artifacts or HTML following
`binpar-brand-design-system` (`references/media.md`).

## Install

### Claude Code plugin marketplace

```
/plugin marketplace add BinPar/skills
/plugin install binpar-brand-design-system@binpar
/plugin install binpar-brand-voice@binpar
/plugin install binpar-documents@binpar
```

Update later with `/plugin marketplace update binpar`. The repo is private: your git
credentials need access to `BinPar/skills`.

### npx skills (Claude Code, Codex and other agents)

```bash
npx skills add BinPar/skills                      # all skills, this project
npx skills add BinPar/skills -g                   # all skills, global
npx skills add BinPar/skills --skill binpar-documents -a claude-code -y
```

### Manual

```bash
git clone git@github.com:BinPar/skills.git ~/dev/binpar-skills
ln -s ~/dev/binpar-skills/skills/binpar-brand-design-system ~/.claude/skills/
ln -s ~/dev/binpar-skills/skills/binpar-brand-voice ~/.claude/skills/
ln -s ~/dev/binpar-skills/skills/binpar-documents ~/.claude/skills/
```

(Codex: same links under `~/.codex/skills/`.)

## Requirements

- `binpar-documents`: Node.js ≥ 22 and Google Chrome / Chromium / Edge / Brave
  (or `npx playwright install chromium`, or `BINPAR_CHROME=/path/to/chrome`).
- The other two skills are reference-only.

## Migrating from `consensus-salutis-skills`

`consensus-salutis-brand-design-system` → `binpar-brand-design-system` and
`consensus-salutis-brand-voice` → `binpar-brand-voice`. In a project installed with
`npx skills`:

```bash
npx skills remove consensus-salutis-brand-design-system consensus-salutis-brand-voice
npx skills add BinPar/skills --skill binpar-brand-design-system --skill binpar-brand-voice -a claude-code -y
```

## Repository layout

```
skills/<skill>/SKILL.md                  skill (frontmatter name = directory name)
skills/<skill>/.claude-plugin/plugin.json
skills/<skill>/references/ assets/ scripts/
.claude-plugin/marketplace.json          marketplace "binpar"
tools/                                   maintainer scripts (asset generation)
```

See [CLAUDE.md](CLAUDE.md) for contribution rules.
