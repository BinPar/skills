# BinPar Logo Usage

> Source: bi-productive production components (`src/components/basics/Logo.tsx`, `src/components/basics/Isologo.tsx`) and `public/` favicon set.

## Logo Suite

| Component | Description | Official colors |
|-----------|-------------|-----------------|
| **LogoMark** | Full logo: "BINPAR" wordmark with corner brackets + "DIGITAL IGNITION" tagline, separated by a vertical rule | BINPAR in Yellow `#FCB810`, tagline + rule in Logo Gray `#9797B9` |
| **BrandSymbol** (isologo) | Hexagonal badge containing the BinPar corner-bracket monogram (the same mark that precedes the wordmark) | Yellow `#FCB810` |

- The **LogoMark** is the primary representation (login, headers, documents).
- The **BrandSymbol** alone is used for small spaces: favicons, app icons, avatars, collapsed sidebars.
- Native aspect ratios: LogoMark `409 × 111`, BrandSymbol `52.89 × 49.99` (~1.06:1).

## Asset Inventory

```
assets/logos/svg/
  LogoMark_Brand.svg        # Official: yellow + gray. For dark backgrounds.
  LogoMark_White.svg        # DERIVED mono white — not in any brandbook
  LogoMark_Black.svg        # DERIVED mono #09080C for light backgrounds — not in any brandbook
  BrandSymbol_Yellow.svg    # Official isologo
  BrandSymbol_White.svg     # DERIVED mono white
  BrandSymbol_Black.svg     # DERIVED mono #09080C
  BrandSymbol_Mono.svg      # Official mono symbol (from safari-pinned-tab, black fill, potrace outline)
```

> **Derived variants**: only `LogoMark_Brand`, `BrandSymbol_Yellow` and `BrandSymbol_Mono` exist in production. The White/Black variants were generated from the official paths for contexts the product never needed (light backgrounds, single-ink print). Prefer the official yellow versions whenever the background allows.

## Choosing a Version

| Background | Logo |
|------------|------|
| Dark (`#09080C`, panels, any dark surface) | `LogoMark_Brand` / `BrandSymbol_Yellow` — the default |
| Yellow `#FCB810` | `BrandSymbol_Black` or `LogoMark_Black` (derived) |
| White / light (print, light emails) | `LogoMark_Black` (derived) |
| Single-ink mono contexts (pinned tabs, engraving) | `BrandSymbol_Mono` |
| Photography | Place on a darkened overlay region, use `LogoMark_Brand` or `LogoMark_White` |

## Production React Components

In bi-productive the logos are inline-SVG React components (no asset request):

```
src/components/basics/Logo.tsx      → <Logo size="..." />      (full LogoMark)
src/components/basics/Isologo.tsx   → <Isologo size="..." />   (BrandSymbol, fill = colors.yellow)
```

When building UI for a BinPar product, replicate this pattern (inline SVG component taking `size`/`className`) rather than `<img>` tags.

## Rules

- Never recolor the wordmark outside the official pairs (yellow+gray) or full mono (all-white / all-`#09080C`). No gradients, no partial recolors, no swapping yellow for another hue.
- The "DIGITAL IGNITION" tagline gray `#9797B9` is exclusive to the logo — never reuse it as a UI color.
- Do not stretch: maintain the native aspect ratio; scale via height.
- Clear space: keep at least the height of the "BINPAR" capitals free around the LogoMark; for the BrandSymbol keep ~25% of its width on all sides.
- On dark surfaces the yellow logo needs no treatment; never add glows, outlines or drop shadows to force contrast — change the placement instead.

## Favicon & PWA Icons

Canonical files (from production `public/`):

```
assets/favicon/favicon.ico                  # classic multi-res favicon
assets/favicon/favicon-16x16.png
assets/favicon/favicon-32x32.png
assets/favicon/apple-touch-icon.png         # 180×180 iOS
assets/favicon/android-chrome-192x192.png   # PWA
assets/favicon/android-chrome-256x256.png   # PWA
assets/favicon/safari-pinned-tab.svg        # mono symbol for Safari pinned tabs
assets/favicon/site.webmanifest
```

**Always use these exact files** for any BinPar web property. Reference HTML (production `layout.tsx`):

```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="manifest" href="/site.webmanifest" />
```

Manifest/theme color is always the brand background:

```json
{ "theme_color": "#09080c", "background_color": "#09080c", "display": "standalone" }
```

```ts
export const viewport = { themeColor: '#09080c' };
```
