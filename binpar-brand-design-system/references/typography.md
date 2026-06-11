# BinPar Typography

> Source: bi-productive production implementation (`src/app/layout.tsx`, `src/styles/globals.css`, `src/config/fonts.ts`).

## Display Typeface: Poppins

- **Style**: Geometric sans-serif, friendly and modern
- **Usage**: Headings, eyebrows/kickers, navigation labels, numeric displays (gauges, timers)
- **Weights used**: Medium (500), SemiBold (600), Bold (700)
- **License**: SIL Open Font License

### Font files

```
assets/fonts/Poppins/Poppins-Medium.ttf
assets/fonts/Poppins/Poppins-SemiBold.ttf
assets/fonts/Poppins/Poppins-Bold.ttf
```

## Body Typeface: Roboto

- **Style**: Neutral, highly legible sans-serif
- **Usage**: Body copy, descriptions, form controls, tables
- **Weights used**: Regular (400), Medium (500), Bold (700)
- **License**: SIL Open Font License (variable font bundled)

### Font files

```
assets/fonts/Roboto/Roboto[wdth,wght].ttf
assets/fonts/Roboto/Roboto-Italic[wdth,wght].ttf
```

## Code Typeface: Fira Code

- **Usage**: Code, tabular time data, monospaced contexts
- **Weights bundled**: Light, Regular, Medium, Semi-bold, Bold (TTF + WOFF2)

### Font files

```
assets/fonts/FiraCode/FiraCode-{Light,Regular,Medium,Semi-bold,Bold}.{ttf,woff2}
```

## Next.js Font Setup (Production)

Fonts are loaded via `next/font/google` and exposed as CSS variables:

```tsx
import { Poppins, Roboto } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--ui-font-display',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--ui-font-body',
  display: 'swap',
});

// <body className={`${poppins.variable} ${roboto.variable}`}>
```

## CSS Variables

```css
:root {
  --ui-font-display: 'Poppins', 'Segoe UI', sans-serif;
  --ui-font-body: 'Roboto', 'Segoe UI', sans-serif;
}

@theme inline {
  --font-sans: var(--ui-font-body);      /* Tailwind: font-sans (default) */
  --font-display: var(--ui-font-display); /* Tailwind: font-display */
}
```

Usage in Tailwind: `font-display` for Poppins, `font-sans` (default) for Roboto.

## Line Heights & Text Size Tokens

```css
:root {
  /* Ratios */
  --ui-leading-body: 1.5;
  --ui-leading-display: 1.35;
  --ui-leading-subtitle: 1.45;
  --ui-leading-eyebrow: 1.2;
  --ui-leading-kicker: 1.25;

  /* Block copy (rem; pairs with ~0.95rem UI copy) */
  --ui-leading-block: 1.5rem;
  --ui-leading-block-loose: 1.75rem;

  /* Sizes */
  --ui-text-eyebrow: 0.68rem;
  --ui-text-kicker: 0.64rem;
  --ui-text-body: 0.95rem;
  --ui-text-meta: 0.78rem;
}
```

Base: `html { font-size: 16px; }`, `body { font-family: var(--ui-font-body); line-height: var(--ui-leading-body); -webkit-font-smoothing: antialiased; }`.

## Typeface Hierarchy

| Level | Font | Weight | Size | Notes |
|-------|------|--------|------|-------|
| Hero display (landing) | Poppins | SemiBold 600 | `2.55rem` → `text-6xl` → `4.65rem` (2xl) | `leading-[1.02]`, `text-balance`, `tracking-[0]` |
| Section title (h2) | Poppins | SemiBold 600 | `text-xl` → `text-3xl` (md) | `leading-tight`, `text-balance` |
| Eyebrow / overline | Poppins | Medium-SemiBold | `0.68rem` (`text-xs` on landing) | UPPERCASE, `letter-spacing: 0.22em` (app) or `tracking-[0]` + `text-yellow` (landing) |
| Kicker | Poppins | Medium 500 | `0.64rem` | UPPERCASE, `letter-spacing: 0.17em`, muted |
| Body copy | Roboto | Regular 400 | `0.95rem` (`text-sm`–`text-base`) | `leading-6`/`leading-8`, `text-secondary` |
| Meta / footer | Roboto | Regular 400 | `0.78rem` | `text-muted` |
| Gauge number | Poppins | Bold 700 | `clamp(2rem, 4vw, 2.9rem)` | `letter-spacing: -0.06em`, `line-height: 1` |

## Semantic Text Utilities (Tailwind v4 `@utility`)

```css
@utility ui-copy {
  font-family: var(--ui-font-body);
  font-size: var(--ui-text-body);
  line-height: var(--ui-leading-block-loose);
  color: var(--ui-color-text-secondary);
}

@utility ui-eyebrow {
  font-family: var(--ui-font-display);
  font-size: var(--ui-text-eyebrow);
  font-weight: 500;
  line-height: var(--ui-leading-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--ui-color-text-muted);
}

@utility ui-kicker {
  font-family: var(--ui-font-display);
  font-size: var(--ui-text-kicker);
  font-weight: 500;
  line-height: var(--ui-leading-kicker);
  text-transform: uppercase;
  letter-spacing: 0.17em;
  color: var(--ui-color-text-muted);
}
```

## Legacy Font Size Scale (`src/config/fonts.ts`)

A pt-named rem scale used by older TS-styled components:

```ts
export const fontSize = {
  F70: '4.375rem', F69: '4.312rem', F53: '3.3125rem', F47: '2.9375rem',
  F45: '2.8125rem', F40: '2.5rem',  F37: '2.31rem',   F35: '2.1875rem',
  F32: '2rem',      F30: '1.875rem', F29: '1.8125rem', F28: '1.75rem',
  F27: '1.6875rem', F26: '1.625rem', F25: '1.5625rem', F24: '1.5rem',
  F23: '1.4375rem', F22: '1.375rem', F21: '1.3125rem', F20: '1.25rem',
  F19: '1.1875rem', F18: '1.125rem', F17: '1.0625rem', F16: '1rem',
  F15: '0.9375rem', F14: '0.875rem', F13: '0.8125rem', F12: '0.75rem',
  F11: '0.6875rem', F10: '0.625rem', F09: '0.5625rem', F08: '0.5rem',
  F07: '0.43rem',
};
```

For new work prefer the semantic CSS variables / Tailwind sizes; use this scale only when matching existing TS-config components.

## Text on Backgrounds

| Background | Text color |
|------------|-----------|
| Page `#09080C` / panels | Primary `#F5F1F8`, secondary `#C8C1D0`, muted `#8F859B` |
| Yellow `#FCB810` fill | Near-black `#111016` — never white |
| Teal `#67D7C3` fill | Near-black `#111016` |

## Text Highlighting

- Highlight keywords and active labels in **BinPar Yellow** (`text-yellow`).
- Success/completed labels switch to **Teal** (`text-teal`).
- Section eyebrows on the landing are yellow; in-app eyebrows are muted.

## Rules

- **Poppins never below Medium (500)**; headings default to SemiBold (600).
- **Eyebrows and kickers are always UPPERCASE** with wide letter-spacing (app) — the landing uses tighter `tracking-[0]` uppercase eyebrows in yellow.
- Headings use `text-balance` and `tracking-[0]` (no extra letter-spacing).
- Body copy is never pure white — use `text-secondary` (`#C8C1D0`) for paragraphs, reserving `text-primary` for headings and key values.
