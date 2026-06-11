# BinPar Iconography & Illustrations

> Source: bi-productive `src/components/basics/icons/`, `src/config/icons.ts`, `public/img/`.

## Icon System

Custom inline-SVG icon components on a **24×24 viewBox**, wrapped by a shared `Icon` base:

```tsx
// src/components/basics/Icon.tsx (pattern)
<i className="icon not-italic" style={{ width: size || iconSize.regular, height: ... }}>
  <svg width="100%" height="100%" viewBox="0 0 24 24"><g>{children}</g></svg>
</i>
```

Each icon (Add, Burger, Calendar, Check, ChevronDown/Left/Right, CloseMenu, Edit, ExternalLink, Filter, GitHub, Home, Info, MobileFilters, OfficeBuilding, PlayPause, Refresh, StopSquare, Sync, Trash, …) is a component taking `size`, `className` and margin props.

### Icon Sizes

```ts
export const iconSize = {
  tiny: '1.25rem',     /* 20px */
  regular: '1.5rem',   /* 24px — default */
  big: '2.5rem',
  large: '3.375rem',
};
```

### Icon Colors

- Default fill: **Blue** `#8C8398` (`colors.blue`) — the muted neutral.
- Active/interactive states: Yellow `#FCB810`.
- State icons follow the state palette (teal good, red bad).
- Filled solid shapes with rounded terminals — no outline-stroke icon style.

### Supplementary Library

`lucide-react` is available for icons not in the custom set (calendar features use it). Match it to the system: 1.5px-ish stroke at 20–24px, colored with the same tokens (`text-muted`, `text-yellow`, …). Prefer the custom set when an equivalent exists.

## Illustrations

Flat vector illustrations (Storyset/Pana style) used on auth and onboarding/empty states, recolored to brand:

```
assets/illustrations/fichar.svg              # time-tracking illustration (clock-in)
assets/illustrations/Click here-pana 1.svg   # onboarding pointer illustration
assets/illustrations/Login-illustration.png  # login page illustration
```

Rules:

- Illustrations are **accents on dark surfaces** — they must carry the brand palette (yellow as the dominant accent, violet-dark neutrals) and sit on transparent backgrounds.
- Use them for empty states, onboarding moments and auth pages; not inside dense data UI.
- For new illustrations, recolor Storyset-style sources to: Yellow `#FCB810`, neutrals from the blue scale (`#8C8398`/`#C8C1D0`), darks from the bg scale.

## Photography

The BinPar digital brand does not use photography in product UI or landings — visual interest comes from live product mockups, the dotted interactive background, and orbital decorations (see `landing-time-tracker.md`). If photography is unavoidable (e.g. team pages, social), keep it dark-treated so yellow accents and white text remain legible.
