# BinPar Skills repository

Skills for Claude Code and Codex. Keep the set minimal: brand identity, brand voice and
document generation. New skills only when they are BinPar-specific and something general
agents can't already do; no integrations (Google Workspace, Notion…) unless indispensable.

## Layout

```
skills/<skill>/SKILL.md                   frontmatter: name (= directory), description (≤ 1024 chars, what + when)
skills/<skill>/.claude-plugin/plugin.json plugin manifest (name, description, version, author BinPar, keywords)
.claude-plugin/marketplace.json           marketplace "binpar": add every new skill to "plugins"
tools/                                    maintainer scripts, not shipped
```

Skill names: lowercase, digits and hyphens, ≤ 64 chars, prefix `binpar-`.
Skill files are written in English; quoted copy and examples are Spanish (es-ES).
SKILL.md stays short (≲ 300 lines); detail goes to `references/`, loaded on demand.

## Sources of truth

- **Visual identity:** *BinPar · Manual de identidad v1.0* (October 2026) and the designer's
  logo exports (`skills/binpar-brand-design-system/assets/logos/`). The manual wins over
  any code. Production code (`consensus-salutis-website`, `consensus-salutis`) only documents
  implementation, in `binpar-brand-design-system/references/web/`, with its deviations listed
  in `references/web/README.md`.
- **Voice:** production website/product copy plus the manual's own copy; rules in
  `binpar-brand-voice` win over live copy for new text.

## Generated assets: never hand-edit

| Output | Source | Command |
|---|---|---|
| App tiles, favicons, PNG logos, flaps; copies of logos, tokens and components into `binpar-documents` | Official SVGs + `assets/css/*.css` in the design system | `node tools/build-brand-assets.mjs` (needs Chrome, Python 3 + Pillow) |
| Static PDF fonts in `binpar-documents/assets/fonts/` | Variable fonts in the design system | `python tools/make-static-fonts.py` (needs `fonttools`) |

After changing `tokens.css` or `components.css`, rerun the build so `binpar-documents`
stays in sync. `binpar-documents` ships its own copies on purpose: each skill must work when
installed alone.

## binpar-documents

Zero-install by design: Node ≥ 22 built-ins + a Chromium browser driven over CDP
(`scripts/lib/chrome.mjs`); `marked` and Paged.js are vendored unmodified in
`scripts/vendor/`. Don't add npm dependencies. After any change, render
`assets/templates/propuesta.md` and `one-pager.html` with `--preview` and look at every page.
