---
name: binpar-brand-design-system
description: >
  BinPar brand design system reference and enforcement guide. Provides color palettes, typography rules,
  logo usage, UI component specs, the signature interactive dotted background, and landing-page patterns.
  Use when creating, reviewing, or modifying any visual design, UI, marketing material, presentation,
  email, social media asset, or web/app interface that must conform to BinPar brand identity. Also use
  when generating CSS, design tokens, or component configurations for BinPar products (e.g. Bi-Productive).
---

# BinPar Brand Design System

## Brand Identity Overview

**BinPar — Digital Ignition.** The BinPar digital brand is **dark-first and yellow-led**: a near-black violet-tinted canvas (`#09080C`) where BinPar Yellow (`#FCB810`) is the only brand accent — logo, CTAs, focus, highlights, scrollbars. Depth comes from translucent glass panels and soft shadows, never from light grays. Interfaces feel calm, technical, and precise.

> Source of truth: the production implementation in the **bi-productive** repo (`src/styles/globals.css`, `src/config/colors.ts`, `src/config/fonts.ts`) — platform and the `/time-tracker` landing. There is no separate brandbook PDF; the code is the brandbook.

---

## Quick Reference: Design Tokens

### Colors (core)

```json
{
  "binpar-yellow":   "#FCB810",
  "background":      "#09080C",
  "background-dark": "#111016",
  "off-white":       "#F5F1F8",
  "text-secondary":  "#C8C1D0",
  "text-muted":      "#8F859B",
  "teal":            "#67D7C3",
  "red":             "#FF6E8E",
  "pink":            "#E684AA",
  "blue":            "#8C8398",
  "blue-lighter":    "#C8C1D0",
  "blue-lightest":   "#F2EDF5",
  "gray":            "#302B36",
  "logo-gray":       "#9797B9"
}
```

Borders are translucent white: `rgba(245,241,248,0.1)` default / `0.06` soft / yellow `rgba(252,184,16,0.32)` strong (focus).

### Typography Hierarchy

| Level | Font | Weight | Size | Notes |
|-------|------|--------|------|-------|
| Hero display | Poppins | SemiBold 600 | 2.55–4.65rem | `leading-[1.02]`, `text-balance` |
| Section title | Poppins | SemiBold 600 | `text-xl`–`text-3xl` | `leading-tight` |
| Eyebrow | Poppins | Medium/SemiBold | 0.68rem | UPPERCASE; yellow on landings, muted in app |
| Body | Roboto | Regular 400 | 0.95rem | `text-secondary`, never pure white |
| Meta | Roboto | Regular 400 | 0.78rem | `text-muted` |
| Code / time data | Fira Code | Regular–Bold | — | monospaced contexts |

### Surfaces & Radius

- Panel: 28px radius, translucent gradient + `backdrop-blur(10px)` + `--ui-shadow-panel`
- Landing band: 34px · Metric card: 18px · Control: 14px · Pill/CTA: `rounded-full`
- Standard transition: **180ms ease**; CTA hover `scale(1.02)` 200ms

---

## Workflow: Applying the Brand

### By task type:

**Web UI / App Interface**
1. Set up the dark theme tokens → see `references/dark-theme.md`
2. Add the interactive dotted background layer → see `references/interactive-background.md`
3. Apply typography (Poppins display / Roboto body) → see `references/typography.md`
4. Build with the panel/control utilities (`ui-panel`, `ui-control`) → see `references/ui-components.md`
5. Icons: custom 24×24 set, default fill `#8C8398` → see `references/iconography-and-illustrations.md`

**Landing / Marketing Page**
1. Reuse the exact app tokens (no separate marketing palette)
2. Follow the /time-tracker patterns: hero with live mockup, 34px section bands, scroll reveals, process flow → see `references/landing-time-tracker.md`
3. Yellow eyebrows, yellow→teal progress story, pill CTA with dark text → see `references/ui-components.md`

**Marketing Asset (Social, Banner, Presentation)**
1. Background: `#09080C` with the body gradient (and static dot grid if possible)
2. Logo: `LogoMark_Brand` (yellow+gray) → see `references/logo-usage.md`
3. Headlines in Poppins SemiBold white; highlight keywords in `#FCB810`
4. One accent story: yellow (plus teal only for success/contrast moments)

**Design Token / CSS Generation**
1. Copy the `--ui-*` custom properties from `references/colors-and-tokens.md`
2. Tailwind v4 `@theme inline` aliases included there
3. Typography variables from `references/typography.md`

**Brand Compliance Review**
1. Run through the checklist below
2. Cross-reference each section against the corresponding reference file

---

## Core Rules Summary

### Color
- **Yellow `#FCB810` is the only brand accent.** Teal/red/pink are state colors (good/bad), not decoration.
- Text on yellow or teal fills is ALWAYS near-black `#111016` — never white.
- Borders are translucent white, not gray. Surfaces are translucent layers + blur, not opaque grays.
- `#9797B9` belongs to the logo tagline only — never a UI color.

### Typography
- Poppins (500/600/700) for headings, eyebrows, numbers; Roboto (400/500/700) for body; Fira Code for code/time data.
- Eyebrows/kickers: always UPPERCASE. App: muted + wide tracking. Landing: yellow + `tracking-[0]`.
- Body copy is `#C8C1D0`, never pure white; headings `text-balance`.

### Logo
- `LogoMark_Brand` (yellow+gray) on dark backgrounds — the default everywhere.
- `BrandSymbol_Yellow` alone for small spaces (favicons, avatars, collapsed nav).
- White/Black variants are DERIVED (not brandbook) — only for light/mono contexts.
- Never recolor partially, stretch, or add effects to force contrast.

### Surfaces & Motion
- Page = `#09080C` + violet gradient + interactive dotted background behind everything.
- Panels: 28px radius, 1px translucent border, gradient fill, blur, heavy soft shadow.
- 180ms ease for controls; focus = yellow border + soft yellow ring; selection/scrollbar are yellow.
- All decorative motion respects `prefers-reduced-motion`.

---

## Dark Theme Quick Reference

| Element | Value |
|---------|-------|
| Background | `#09080C` + `linear-gradient(180deg, rgba(31,19,41,0.9), #09080c)` |
| Panel surface | `linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))` + blur |
| Control surface | `rgba(21,18,28,0.96)` → hover `rgba(29,25,37,0.98)` |
| Primary text | `#F5F1F8` |
| Secondary text | `#C8C1D0` |
| Muted text | `#8F859B` |
| Border | `rgba(245,241,248,0.1)` |
| Accent / focus | `#FCB810` |
| Logo | `LogoMark_Brand` |

**The system is dark-only** — no light mode, no theme switcher. For print/email (inherently light) see the "Light contexts" section in `references/dark-theme.md`.

---

## Asset Inventory

### Logos (7 files)
```
assets/logos/svg/
  LogoMark_Brand.svg        # official: BINPAR yellow + DIGITAL IGNITION gray (409×111)
  LogoMark_White.svg        # derived mono white
  LogoMark_Black.svg        # derived mono #09080C
  BrandSymbol_Yellow.svg    # official hexagonal isologo (52.89×49.99)
  BrandSymbol_White.svg     # derived mono white
  BrandSymbol_Black.svg     # derived mono #09080C
  BrandSymbol_Mono.svg      # official mono symbol (safari-pinned-tab outline)
```

### Favicon / PWA (8 files)
```
assets/favicon/favicon.ico
assets/favicon/favicon-16x16.png
assets/favicon/favicon-32x32.png
assets/favicon/apple-touch-icon.png         # 180×180
assets/favicon/android-chrome-192x192.png
assets/favicon/android-chrome-256x256.png
assets/favicon/safari-pinned-tab.svg
assets/favicon/site.webmanifest             # theme/background color #09080c
```
These are the canonical favicon assets of bi-productive. **Always use these exact files** for any BinPar web property. Reference HTML in `references/logo-usage.md`.

### Fonts
```
assets/fonts/Poppins/Poppins-{Medium,SemiBold,Bold}.ttf            (OFL)
assets/fonts/Roboto/Roboto[wdth,wght].ttf + Italic                 (OFL, variable)
assets/fonts/FiraCode/FiraCode-{Light,Regular,Medium,Semi-bold,Bold}.{ttf,woff2}  (OFL)
```
In Next.js production, Poppins/Roboto load via `next/font/google` (see `references/typography.md`); the TTFs here are for offline/design tooling.

### Illustrations
```
assets/illustrations/fichar.svg
assets/illustrations/Click here-pana 1.svg
assets/illustrations/Login-illustration.png
```

### Naming Conventions
- Logo variants: `{Component}_{ColorVersion}.svg` (e.g. `LogoMark_Brand.svg`, `BrandSymbol_Yellow.svg`)
- `Brand` = official multicolor; `Yellow`/`White`/`Black`/`Mono` = single-color versions
- Tokens: CSS custom properties prefixed `--ui-*` (colors, type, spacing) and `--background-*` (interactive background)

---

## Brand Compliance Checklist

When reviewing or producing any BinPar artifact, verify:

- [ ] **Background**: `#09080C` (+gradient)? Dark-only, no improvised light mode?
- [ ] **Yellow discipline**: `#FCB810` as the single brand accent? Teal/red used only for states?
- [ ] **Text on fills**: near-black `#111016` on yellow/teal buttons — never white?
- [ ] **Logo**: correct variant for the background? Native proportions? No effects/partial recolors?
- [ ] **`#9797B9`**: only inside the logo?
- [ ] **Typography**: Poppins headings (≥500), Roboto body, Fira Code for code? Eyebrows uppercase?
- [ ] **Body text**: `#C8C1D0` secondary (not pure white)? Muted `#8F859B` only for meta?
- [ ] **Surfaces**: translucent panels + blur + soft shadow? Radius scale (34/28/18/14/full)?
- [ ] **Borders**: translucent white (`rgba(245,241,248,0.1)`), yellow only on focus/strong?
- [ ] **Motion**: 180ms ease controls? Reduced-motion fallbacks for decorative layers?
- [ ] **Focus/selection/scrollbar**: yellow?
- [ ] **Background layer**: interactive dots present (or static dot grid in non-web media)?
- [ ] **Landing**: yellow eyebrows, live mockups, yellow→teal progress story, pill CTA?
- [ ] **Favicons**: canonical files + `theme_color #09080c`?

---

## Reference Files Index

| File | Topic | Read when... |
|------|-------|-------------|
| `references/colors-and-tokens.md` | Full palette, semantic CSS vars, Tailwind v4 theme, state colors | Setting up colors, generating tokens |
| `references/typography.md` | Poppins/Roboto/Fira Code, next/font setup, scales, text utilities | Configuring typography, checking text styling |
| `references/logo-usage.md` | Logo suite, variants, favicon/PWA set, rules | Placing logos, choosing versions, favicons |
| `references/dark-theme.md` | Dark-only theming, depth model, global interaction styles | Implementing theme, CSS variables, light-media exceptions |
| `references/ui-components.md` | Panels, controls, CTAs, gauges, spacing tokens, motion | Building UI components |
| `references/interactive-background.md` | Signature dotted background: CSS + client logic | Creating page shells, hero canvases |
| `references/landing-time-tracker.md` | Landing patterns: hero, section bands, reveals, process flow | Building marketing/narrative pages |
| `references/iconography-and-illustrations.md` | Icon system, sizes, lucide fallback, illustrations | Choosing icons/illustrations |

---

## Examples

### Example 1: Dashboard panel

**Request**: "Create a metrics panel for a BinPar app"

**Expected behavior**: Dark page (`#09080C` + gradient) with InteractiveBackground behind. Panel with 28px radius, translucent gradient fill, 1px `rgba(245,241,248,0.1)` border, `backdrop-blur(10px)`, `--ui-shadow-panel`. Muted uppercase eyebrow (Poppins, 0.68rem, 0.22em tracking) + SemiBold title. Metric cards at 18px radius with soft borders. Values in Poppins; good/bad states in teal/red; the key highlight in yellow.

### Example 2: Landing hero

**Request**: "Create a hero section for a BinPar product landing"

**Expected behavior**: Follow /time-tracker: yellow uppercase eyebrow, Poppins SemiBold display (`leading-[1.02]`, `text-balance`), secondary Roboto copy ≤`max-w-2xl`, and a live product mockup in the second column instead of an image. Pill CTA `bg-yellow` with `text-[#111016]`, glow shadow, `hover:scale-[1.02]`. OrbitalBackdrop decoration at ≤12% alpha.

### Example 3: CSS tokens

**Request**: "Generate CSS variables for BinPar"

**Expected behavior**: Output the `--ui-*` custom-property block from `references/colors-and-tokens.md` verbatim (colors, shadows), plus the typography variables and the Tailwind v4 `@theme inline` aliases. Dark-only — no `[data-theme]` switching.

---

## Source Traceability

| Skill section | Source in bi-productive |
|---------------|------------------------|
| Colors & tokens | `src/config/colors.ts`, `src/styles/globals.css` |
| Typography | `src/app/layout.tsx`, `src/config/fonts.ts`, `globals.css` |
| Logos | `src/components/basics/Logo.tsx`, `Isologo.tsx`, `public/` favicons |
| UI components | `globals.css` `@utility` blocks, time-tracker-guide components |
| Interactive background | `src/components/layout/InteractiveBackground.tsx`, `globals.css` |
| Landing patterns | `src/app/(public)/time-tracker/`, `src/components/features/time-tracker-guide/` |
| Iconography | `src/components/basics/icons/`, `src/config/icons.ts`, `public/img/` |
