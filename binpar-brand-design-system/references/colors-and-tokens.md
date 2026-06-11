# BinPar Colors and Design Tokens

> Source: bi-productive production implementation (`src/config/colors.ts` + `src/styles/globals.css`).
> The BinPar digital brand is **dark-first**: every official surface is dark, with BinPar Yellow as the single primary accent.

## Main Colors

| Name | HEX | Role |
|------|-----|------|
| BinPar Yellow | `#FCB810` | Primary brand color. Accents, CTAs, highlights, focus rings, scrollbar |
| Background | `#09080C` | Base page background (near-black with violet undertone) |
| Off White | `#F5F1F8` | Primary text / light foreground |

BinPar Yellow is the brand: it is the color of the logo, every primary action, and every "active" state. Everything else stays dark and desaturated so the yellow reads instantly.

## Background Scale

| Name | HEX / value | Use |
|------|-------------|-----|
| `bg` | `#09080C` | Page base |
| `bgHalf` | `rgba(9, 8, 12, 0.78)` | Overlays, scrims |
| `bgLight` | `#403449` | Lightest surface (legacy) |
| `bgMed` | `#18141E` | Mid surface (legacy) |
| `bgDark` | `#111016` | Dark surface, scrollbar track |
| `bgDarker` | `#0A090D` | Deeper surface (legacy) |
| `bgDarkest` | `#06060A` | Deepest surface (legacy) |

The body background is not flat — it uses a vertical gradient:

```css
body {
  background-color: #09080c;
  background-image: linear-gradient(180deg, rgba(31, 19, 41, 0.9) 0%, #09080c 100%);
}
```

## Neutral / "Blue" Scale (cool grays)

BinPar neutrals are violet-tinted cool grays, named "blue" in the codebase:

| Name | HEX | Use |
|------|-----|------|
| Blue | `#8C8398` | Muted elements, default icon fill |
| Blue Lighter | `#C8C1D0` | Secondary text |
| Blue Lightest | `#F2EDF5` | Near-white foreground |
| Gray | `#302B36` | Dark neutral, dividers on solid surfaces |

## Accent Colors

Use sparingly. Yellow is always the dominant accent; teal/pink/red are **state colors**, not decoration.

| Name | HEX | Role |
|------|-----|------|
| Teal | `#67D7C3` | Success / good / completed states |
| Teal Darker | `#216D62` | Strong teal (borders, emphasis) |
| Pink | `#E684AA` | Negative-tinted data (day states) |
| Pink Darker | `#8A4968` | Strong pink |
| Red | `#FF6E8E` | Errors / bad states |
| Red Dark | `#A7375A` | Strong error |
| Secondary (purple) | `#7B4BA1` | Secondary palette (light `#C99AF0`, dark `#4C245F`) — rare, legacy |

### Semantic State Mapping

| State | Color |
|-------|-------|
| `pointStateGood` / `pointStateGoodStrong` | `#67D7C3` Teal |
| `pointStateWarning` | `#FCB810` Yellow |
| `pointStateBad` | `#FF6E8E` Red |
| `pointStateBadStrong` | `#A7375A` Red Dark |
| `dayGood` | `rgba(103, 215, 195, 0.16)` |
| `dayBad` | `rgba(230, 132, 170, 0.14)` |
| `dayNull` | `rgba(140, 131, 152, 0.18)` |

## Transparency Variants

Alpha variants of core colors are first-class tokens (with solid fallbacks for contexts that cannot composite):

| Name | Value | Solid fallback |
|------|-------|----------------|
| `white15` | `rgba(245, 241, 248, 0.08)` | `#1B1820` |
| `yellow10` | `rgba(252, 184, 16, 0.10)` | `#17120D` |

## Semantic CSS Custom Properties

Canonical tokens from `globals.css` — use these names when generating CSS for any BinPar property:

```css
:root {
  --ui-color-bg: #09080c;
  --ui-color-bg-dark: #111016;
  --ui-color-yellow: #fcb810;
  --ui-color-teal: #67d7c3;
  --ui-color-blue: #8c8398;
  --ui-color-blue-lighter: #c8c1d0;
  --ui-color-blue-lightest: #f2edf5;
  --ui-color-gray: #302b36;
  --ui-color-red: #ff6e8e;
  --ui-color-surface-2: rgba(21, 18, 28, 0.96);
  --ui-color-surface-3: rgba(29, 25, 37, 0.98);
  --ui-color-surface-accent-solid: #14100d;
  --ui-color-border: rgba(245, 241, 248, 0.1);
  --ui-color-border-soft: rgba(245, 241, 248, 0.06);
  --ui-color-border-strong: rgba(252, 184, 16, 0.32);
  --ui-color-text-primary: #f5f1f8;
  --ui-color-text-secondary: #c8c1d0;
  --ui-color-text-muted: #8f859b;

  --ui-shadow-panel: 0 32px 72px -44px rgba(0, 0, 0, 0.88), 0 14px 32px -24px rgba(0, 0, 0, 0.66);
  --ui-shadow-soft: 0 18px 42px -30px rgba(0, 0, 0, 0.8);
  --ui-shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
```

## Design Tokens (JSON)

```json
{
  "color": {
    "binpar-yellow":   { "value": "#FCB810" },
    "background":      { "value": "#09080C" },
    "background-dark": { "value": "#111016" },
    "off-white":       { "value": "#F5F1F8" },
    "teal":            { "value": "#67D7C3" },
    "teal-darker":     { "value": "#216D62" },
    "pink":            { "value": "#E684AA" },
    "pink-darker":     { "value": "#8A4968" },
    "red":             { "value": "#FF6E8E" },
    "red-dark":        { "value": "#A7375A" },
    "blue":            { "value": "#8C8398" },
    "blue-lighter":    { "value": "#C8C1D0" },
    "blue-lightest":   { "value": "#F2EDF5" },
    "gray":            { "value": "#302B36" },
    "logo-gray":       { "value": "#9797B9" }
  }
}
```

> `logo-gray` (`#9797B9`) appears **only** in the "DIGITAL IGNITION" tagline of the logo — never use it as a UI color.

## Tailwind v4 Theme Block

bi-productive uses Tailwind v4 CSS-first configuration. The Tailwind-facing aliases:

```css
@theme inline {
  --color-primary: var(--ui-color-text-primary);
  --color-secondary: var(--ui-color-text-secondary);
  --color-muted: var(--ui-color-text-muted);

  --color-yellow: var(--ui-color-yellow);
  --color-teal: var(--ui-color-teal);
  --color-red: var(--ui-color-red);
  --color-blue: var(--ui-color-blue);
  --color-blue-lighter: var(--ui-color-blue-lighter);
  --color-blue-lightest: var(--ui-color-blue-lightest);

  --color-surface-2: var(--ui-color-surface-2);
  --color-surface-3: var(--ui-color-surface-3);
  --color-border: var(--ui-color-border);
  --color-border-soft: var(--ui-color-border-soft);
  --color-border-strong: var(--ui-color-border-strong);

  --shadow-panel: var(--ui-shadow-panel);
  --shadow-soft: var(--ui-shadow-soft);
  --shadow-inset: var(--ui-shadow-inset);
}
```

Usage in markup: `text-primary`, `text-secondary`, `text-muted`, `text-yellow`, `bg-yellow`, `border-border`, `border-yellow/30`, `shadow-panel`, etc.

## Color Pairing Matrix

| Background | Primary text | Accent | Notes |
|------------|--------------|--------|-------|
| `#09080C` (page) | `#F5F1F8` | Yellow `#FCB810` | Default pairing everywhere |
| Surface 2/3 (panels) | `#F5F1F8` / `#C8C1D0` | Yellow | Borders `rgba(245,241,248,0.1)` |
| Yellow `#FCB810` (CTA fill) | `#111016` (near-black) | — | Text on yellow is ALWAYS dark, never white |
| Teal `#67D7C3` (success fill) | `#111016` | — | Same dark-text rule as yellow |

## Usage Rules

- **Yellow is the only brand accent.** Teal/red/pink communicate state; do not use them decoratively.
- **Never put white text on yellow or teal fills** — always near-black `#111016`.
- **Borders are translucent white**, not gray: `rgba(245, 241, 248, 0.1)` default, `0.06` soft, yellow `0.32` for focus/strong.
- **Surfaces are translucent layers over the body gradient** (`surface-2`, `surface-3`) combined with `backdrop-filter: blur(10px)` — avoid flat opaque grays.
- **Highlights in running text** use `text-yellow`.
- Selection and focus are yellow: `::selection { background: rgba(252, 184, 16, 0.2); }`, `:focus-visible { outline: 2px solid var(--ui-color-yellow); }`.
