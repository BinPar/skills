# BinPar UI Components

> Source: bi-productive `src/styles/globals.css` (Tailwind v4 `@utility` blocks) and production components.
> Stack: Next.js 15 + Tailwind CSS v4 (CSS-first config) + `motion` (Framer Motion) + custom component library — **no shadcn/ui, no external UI kit**.

## Border Radius Scale

| Radius | Use |
|--------|-----|
| `34px` | Landing section bands |
| `28px` | App panels, gauge wrappers |
| `18px` | Metric cards |
| `14px` | Controls (inputs, selects, buttons-as-controls) |
| `999px` / `rounded-full` | Pills, CTAs, scrollbar thumb |

## Panels (`ui-panel`)

The core container. Translucent gradient over the dark body, blurred backdrop, heavy soft shadow:

```css
@utility ui-panel {
  position: relative;
  margin-top: var(--ui-rhythm-section);
  display: flex;
  width: 100%;
  flex: 1 1 0%;
  flex-direction: column;
  border-radius: 28px;
  border-width: 1px;
  border-color: var(--ui-color-border);
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
  padding: var(--ui-pad-panel);          /* 1rem; 1.5rem ≥48rem */
  box-shadow: var(--ui-shadow-panel);
  backdrop-filter: blur(10px);
}
```

## Controls (`ui-control` + `ui-control-focus`)

Inputs, selects, and button-like controls share one recipe:

```css
@utility ui-control {
  display: flex;
  align-items: center;
  border-radius: 14px;
  border-width: 1px;
  border-color: var(--ui-color-border);
  background-color: var(--ui-color-surface-2);
  color: var(--ui-color-text-primary);
  box-shadow: var(--ui-shadow-inset);
  transition-property: border-color, background-color, box-shadow, transform;
  transition-duration: 180ms;
  transition-timing-function: ease;
}

@utility ui-control-focus {
  &:hover {
    border-color: rgba(245, 241, 248, 0.16);
    background-color: var(--ui-color-surface-3);
  }
  &:focus-within,
  &:focus-visible {
    border-color: var(--ui-color-border-strong);
    box-shadow: var(--ui-shadow-inset), 0 0 0 4px rgba(252, 184, 16, 0.08);
  }
}
```

**The interaction signature**: 180ms ease transitions, hover lightens surface + border, focus turns the border yellow and adds a soft yellow ring.

## Metric Cards (`ui-metric-card`)

```css
@utility ui-metric-card {
  border-radius: 18px;
  border-width: 1px;
  border-color: var(--ui-color-border-soft);
  background-color: rgba(255, 255, 255, 0.016);
}
```

## Primary CTA (pill button)

Production pattern (landing CTA, `ClosingSection.tsx`): yellow pill, **dark text**, glow shadow, subtle scale on hover:

```html
<a class="flex min-h-10 w-fit items-center justify-center rounded-full
  border border-yellow/40 bg-yellow px-5
  text-sm font-semibold text-[#111016]
  shadow-[0_18px_42px_-28px_rgba(252,184,16,0.8)]
  transition-[transform,background-color,border-color,box-shadow] duration-200
  hover:scale-[1.02]
  focus-visible:border-border-strong focus-visible:outline-none
  focus-visible:shadow-[var(--ui-shadow-inset),0_0_0_4px_rgba(252,184,16,0.12)]">
  Ir al Timer
</a>
```

Success-state variant swaps yellow for teal: `border-teal/30 bg-teal shadow-[0_18px_42px_-28px_rgba(103,215,195,0.8)]`.

| Variant | Fill | Text | Use |
|---------|------|------|-----|
| Primary | Yellow `#FCB810` | `#111016` | Main CTAs |
| Success | Teal `#67D7C3` | `#111016` | Completed-state CTAs |
| Secondary / control | `ui-control` recipe (dark surface, 14px radius) | `#F5F1F8` | In-app actions, toolbars |

Text on yellow/teal fills is always near-black — never white.

## Eyebrows, Kickers, Copy

See `typography.md` for `ui-eyebrow`, `ui-kicker`, `ui-copy` utilities. Section headers follow the pattern: yellow uppercase eyebrow → SemiBold Poppins title → secondary Roboto description.

## Status / State Colors in Components

| State | Color usage |
|-------|-------------|
| Good / completed | Teal `#67D7C3` text or `bg-teal/16`-style tints |
| Warning / in progress | Yellow `#FCB810` |
| Bad / error | Red `#FF6E8E` (strong `#A7375A`) |
| Neutral / empty | `rgba(140, 131, 152, 0.18)` |

Accent panel tints (e.g. highlighted section): `border-yellow/30` + `bg-[linear-gradient(135deg,rgba(252,184,16,0.14),rgba(255,255,255,0.018)_44%,rgba(252,184,16,0.08))]` (teal equivalent for success).

## Gauges (react-gauge-component)

```css
.gauge-chartWrapper { position: relative; overflow: hidden; border-radius: 28px; padding: 1.25rem 1rem 0.75rem; }
.gauge-chartWrapper .arc { opacity: 0.75; mix-blend-mode: lighten; }
/* highlighted arc: opacity 1, stroke var(--gauge-highlight-color), stroke-width 10px */
.gauge-textWrapper .number { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 2.9rem); letter-spacing: -0.06em; line-height: 1; }
.gauge-textWrapper .text { font-size: 0.76rem; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; color: var(--color-text-muted); }
```

## Spacing & Rhythm Tokens

```css
:root {
  --ui-rhythm-section: 0.75rem;   --ui-rhythm-section-lg: 1rem;
  --ui-rhythm-head: 0.375rem;     /* eyebrow → title gap */
  --ui-pad-panel: 1rem;           --ui-pad-panel-md: 1.5rem;
  --ui-pad-page-x: 1rem;  --ui-pad-page-x-md: 2rem;  --ui-pad-page-x-lg: 2.5rem;  --ui-pad-page-x-xl: 3rem;
  --ui-pad-page-b: 2.5rem;
  --ui-stack-page: 2rem;  --ui-stack-relaxed: 2.5rem;  --ui-stack-loose: 3.75rem;
  --ui-space-header-edge: 0.5rem;     --ui-space-header-edge-lg: 0.75rem;
  --ui-space-header-gutter: 1rem;     --ui-space-header-gutter-lg: 1.25rem;
  --ui-space-header-block: 1.75rem;   --ui-space-header-rule: 1rem;
  --ui-space-header-columns: 1.5rem;
}
```

Exposed to Tailwind as `spacing-ui-*` aliases (`pt-ui-section`, `px-ui-page-x`, `gap-ui-header-gutter`, ...).

## Motion Conventions

- Standard control transition: **180ms ease** (border, background, shadow, transform).
- CTA hover: **200ms**, `scale(1.02)`.
- Section/band state changes: **300ms** (`transition-[background,border-color] duration-300`).
- Scroll reveals: motion (Framer Motion), `duration: 0.42`, `ease: [0.22, 1, 0.36, 1]` (see `landing-time-tracker.md`).
- Idle/decorative fades: **1.5s ease-out**.
- Everything decorative must respect `prefers-reduced-motion: reduce`.

## Root Layout Pattern

```tsx
<body className={`${poppins.variable} ${roboto.variable} relative isolate`}>
  <InteractiveBackground />
  <div className="relative z-10 min-h-screen">{children}</div>
</body>
```

The dotted interactive background sits at `z-0` behind everything (see `interactive-background.md`); app content layers above at `z-10`.
