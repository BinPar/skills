# BinPar Interactive Background

> Source: bi-productive `src/components/layout/InteractiveBackground.tsx` + `src/styles/globals.css`.
> The signature ambient layer of every BinPar surface: a fixed dotted grid over the dark gradient, with a pointer-following glow and dot highlight on desktop.

## Anatomy

Three stacked, pointer-transparent layers fixed behind the app (`z-0`; content goes at `z-10`):

1. **`__dots`** — static dot grid (radial-gradient pattern), always visible at low opacity.
2. **`__glow`** — large radial glow following the cursor (warm white core, faint yellow halo).
3. **`__dots--active`** — brighter copy of the dot grid, masked to a halo around the cursor, so dots "light up" near the pointer.

```html
<div class="interactive-background" aria-hidden="true" data-mode="interactive|static" data-cursor-state="active|idle">
  <div class="interactive-background__dots"></div>
  <div class="interactive-background__glow"></div>
  <div class="interactive-background__dots interactive-background__dots--active"></div>
</div>
```

## Tokens

```css
:root {
  --background-dot-spacing: 14px;
  --background-dot-size: 0.8px;
  --background-dot-color: rgba(245, 241, 248, 0.15);
  --background-dot-active-color: rgba(245, 241, 248, 0.42);
  --background-pointer-x: 50vw;
  --background-pointer-y: 35vh;
  --background-pointer-opacity: 0;
  --background-halo-size: 180px;
  --background-glow-size: 250px;
}

/* Mobile: tighter, fainter grid */
@media (max-width: 1023px) {
  :root {
    --background-dot-spacing: 13px;
    --background-dot-color: rgba(245, 241, 248, 0.085);
  }
}
```

## CSS

```css
.interactive-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  transform: translateZ(0);
}

.interactive-background > div {
  position: absolute;
  inset: -1px;
}

.interactive-background__dots {
  inset: calc(var(--background-dot-spacing) * 0.5);
  background-image: radial-gradient(
    circle,
    var(--background-dot-color) 0 var(--background-dot-size),
    transparent calc(var(--background-dot-size) + 0.45px)
  );
  background-position: 0 0;
  background-size: var(--background-dot-spacing) var(--background-dot-spacing);
  opacity: 0.64;
}

.interactive-background__glow {
  background: radial-gradient(
    circle var(--background-glow-size) at var(--background-pointer-x) var(--background-pointer-y),
    rgba(248, 242, 255, 0.045),
    rgba(252, 184, 16, 0.018) 26%,
    transparent 72%
  );
  opacity: calc(var(--background-pointer-opacity) * 0.4);
  transition: opacity 180ms ease-out;
}

.interactive-background__dots--active {
  inset: calc(var(--background-dot-spacing) * 0.5);
  background-image: radial-gradient(
    circle,
    var(--background-dot-active-color) 0 calc(var(--background-dot-size) + 0.02px),
    transparent calc(var(--background-dot-size) + 0.55px)
  );
  opacity: calc(var(--background-pointer-opacity) * 0.62);
  transition: opacity 180ms ease-out;
  -webkit-mask-image: radial-gradient(
    circle var(--background-halo-size) at var(--background-pointer-x) var(--background-pointer-y),
    rgba(0, 0, 0, 0.84),
    transparent 76%
  );
  mask-image: radial-gradient(
    circle var(--background-halo-size) at var(--background-pointer-x) var(--background-pointer-y),
    rgba(0, 0, 0, 0.84),
    transparent 76%
  );
}

/* Slow, gentle fade when the cursor goes idle */
.interactive-background[data-cursor-state='idle'] .interactive-background__glow,
.interactive-background[data-cursor-state='idle'] .interactive-background__dots--active {
  transition-duration: 1.5s;
  transition-timing-function: ease-out;
}

/* Static mode (mobile / touch / reduced motion): glow layers off */
.interactive-background[data-mode='static'] .interactive-background__glow,
.interactive-background[data-mode='static'] .interactive-background__dots--active {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .interactive-background__glow,
  .interactive-background__dots--active {
    opacity: 0;
    transition: none;
  }
}
```

## Behavior (client component)

Key constants and logic from `InteractiveBackground.tsx`:

```ts
const DESKTOP_BREAKPOINT = 1024;   // interactive only ≥1024px
const IDLE_RESET_DELAY = 120;      // ms without movement → idle
const IDLE_CHECK_INTERVAL = 80;    // idle poll cadence
const POSITION_EASING = 0.12;      // lerp factor per frame
```

- Interactivity requires ALL of: no `prefers-reduced-motion`, `(hover: hover) and (pointer: fine)`, viewport ≥ 1024px. Otherwise `data-mode="static"` (dots only, no glow).
- On `pointermove` the target position updates and `--background-pointer-x/y` are eased toward it each `requestAnimationFrame` with `current += (target - current) * 0.12`; the loop stops when the delta < 0.1px.
- `data-cursor-state` flips to `idle` after 120ms without movement (checked every 80ms), and on `blur`/`pointerleave` — the glow then fades out over 1.5s.
- Listeners are passive; media query changes re-evaluate interactivity live.
- The element is `aria-hidden="true"` and `pointer-events: none` — purely decorative.

## Integration

```tsx
<body className="relative isolate">
  <InteractiveBackground />
  <div className="relative z-10 min-h-screen">{/* app */}</div>
</body>
```

Reuse this layer for any BinPar web property's base canvas. For non-interactive media (slides, posters, emails), approximate it with the static dot grid (`14px` spacing, `0.8px` dots at `rgba(245,241,248,0.15)`, 64% opacity) over the body gradient.
