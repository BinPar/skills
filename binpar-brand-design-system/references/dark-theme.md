# BinPar Dark Theme Guide

> The BinPar digital brand is **dark-only**. There is no light mode in any production property — do not add a theme switcher or generate light-mode variants of app UI. (For inherently light media — print, email — see "Light contexts" at the end.)

## Theme Foundation

| Element | Value | Token |
|---------|-------|-------|
| Page background | `#09080C` + gradient `linear-gradient(180deg, rgba(31,19,41,0.9) 0%, #09080c 100%)` | `--ui-color-bg` |
| Dark surface (tracks, wells) | `#111016` | `--ui-color-bg-dark` |
| Panel surface | translucent gradient `rgba(255,255,255,0.02) → 0.01` over the page | `ui-panel` utility |
| Control surface | `rgba(21, 18, 28, 0.96)` | `--ui-color-surface-2` |
| Hover surface | `rgba(29, 25, 37, 0.98)` | `--ui-color-surface-3` |
| Primary text | `#F5F1F8` | `--ui-color-text-primary` |
| Secondary text | `#C8C1D0` | `--ui-color-text-secondary` |
| Muted text | `#8F859B` | `--ui-color-text-muted` |
| Border | `rgba(245, 241, 248, 0.1)` | `--ui-color-border` |
| Border soft | `rgba(245, 241, 248, 0.06)` | `--ui-color-border-soft` |
| Border strong (focus) | `rgba(252, 184, 16, 0.32)` | `--ui-color-border-strong` |
| Accent | `#FCB810` BinPar Yellow | `--ui-color-yellow` |
| Logo | `LogoMark_Brand` (yellow + gray) | — |

## Depth Model

Depth comes from **translucency + blur + heavy soft shadows**, not from lighter grays:

1. Body: dark gradient + the interactive dotted background (see `interactive-background.md`).
2. Panels: `ui-panel` — translucent white gradient, 1px translucent border, `backdrop-filter: blur(10px)`, `--ui-shadow-panel`.
3. Controls inside panels: `surface-2` → `surface-3` on hover, `--ui-shadow-inset` top highlight.

```css
--ui-shadow-panel: 0 32px 72px -44px rgba(0, 0, 0, 0.88), 0 14px 32px -24px rgba(0, 0, 0, 0.66);
--ui-shadow-soft: 0 18px 42px -30px rgba(0, 0, 0, 0.8);
--ui-shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.03);
```

## Global Interaction Styles

```css
::placeholder { color: var(--ui-color-text-muted); }

:focus-visible {
  outline: 2px solid var(--ui-color-yellow);
  outline-offset: 2px;
}

::selection {
  background: rgba(252, 184, 16, 0.2);
  color: var(--ui-color-text-primary);
}
```

### Brand Scrollbar

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--ui-color-bg-dark); }
::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(252, 184, 16, 0.72), rgba(252, 184, 16, 0.42));
}
::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(252, 184, 16, 0.88), rgba(252, 184, 16, 0.56));
}
::-webkit-scrollbar-corner { background: var(--ui-color-bg); }
```

## Accessibility & Motion

- Honor `prefers-reduced-motion: reduce`: decorative motion (background glow, reveals) collapses to static/instant states.
- Yellow on `#09080C` has ~10.7:1 contrast — safe for text of any size. Muted text `#8F859B` is for non-essential meta only.
- Focus is always visible and yellow; never remove outlines without a replacement ring.

## Light Contexts (print, email)

There is **no official light theme**. When a deliverable must be light (print documents, plain-HTML email):

- Background: white; text: `#09080C` / `#302B36`.
- Logo: `LogoMark_Black.svg` (derived mono) — or the official yellow LogoMark on a dark header band.
- Keep yellow `#FCB810` for accents on white (borders, rules, icons); avoid yellow body text on white (low contrast).
- Mark such pieces as off-system: do not back-port light styles into product UI.
