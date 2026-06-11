# BinPar Landing Patterns — /time-tracker

> Source: bi-productive `src/app/(public)/time-tracker/` + `src/components/features/time-tracker-guide/`.
> The /time-tracker guide is the reference implementation for BinPar **marketing/narrative pages**: same tokens as the app, plus a set of landing-specific patterns documented here.

## Page Anatomy

```
GuideNav            sticky nav with section anchors
GuideHero           full-width hero: copy column + live demo panel (interactive mockup)
NarrativeSection    scroll-driven story (NarrativeRail desktop / MobileNarrative)
RulesSection        rule cards
StatusSection       weekly status visualization (mockups)
CorrectionSection   error-correction walkthrough
PrivacySection      privacy notes
ClosingSection      tinted CTA band
ProcessFlowOverlay  animated SVG flow connecting sections (desktop)
```

All wrapped in the standard app shell (InteractiveBackground behind, content at `z-10`).

## Hero Pattern (`GuideHero`)

Two-column grid on xl+ (copy left, live demo right), stacked on mobile:

```
xl:grid-cols-[minmax(21rem,0.78fr)_minmax(39rem,2fr)]
```

Copy column:

```html
<p class="font-display text-[0.72rem] font-semibold uppercase tracking-[0] text-yellow">
  Guia de fichaje                                    <!-- yellow eyebrow -->
</p>
<h1 class="mt-4 text-balance font-display text-[2.55rem] font-semibold leading-[1.02]
           tracking-[0] text-primary sm:text-6xl 2xl:text-[4.65rem]">
  Tu jornada trackeada                               <!-- hero display -->
</h1>
<p class="mt-5 max-w-2xl text-sm leading-6 text-secondary sm:text-base sm:leading-8">
  ...                                                <!-- supporting copy -->
</p>
```

Instead of a static hero image, the hero embeds a **live product mockup** (`LiveDemoPanel` + `HeroTimeline` scene selector) — BinPar landings demo the real product.

## Section Bands (`SectionBand`)

Every content section is a large rounded glass band:

```html
<section class="scroll-mt-34 rounded-[34px] border border-border
  bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.01))]
  p-5 shadow-panel backdrop-blur-[10px] sm:p-7 lg:p-10 xl:p-12">
  <div class="mb-10 flex w-full max-w-3xl flex-col">
    <p class="font-display text-xs font-semibold uppercase tracking-[0] text-yellow">{eyebrow}</p>
    <h2 class="mt-2 text-balance font-display text-xl font-semibold leading-tight tracking-[0] text-primary md:text-3xl">{title}</h2>
    <p class="mt-4 text-sm leading-6 text-secondary sm:text-base sm:leading-8">{description}</p>
  </div>
  <!-- content -->
</section>
```

Optional `align="right"` mirrors the header (`items-end text-right`) to alternate rhythm down the page.

## Scroll Reveals (`RevealBlock`)

Content blocks paint in as a scroll-driven index advances (motion/Framer Motion):

```tsx
<motion.div
  animate={{ opacity: isPainted ? 1 : 0, scale: isPainted ? 1 : 0.965, y: isPainted ? 0 : 28 }}
  initial={false}
  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
  className="origin-top will-change-transform"
/>
```

- Unpainted blocks get `pointer-events-none`.
- With `prefers-reduced-motion`, everything renders painted immediately (`isReducedMotion` short-circuit).
- Blocks carry `data-guide-process-anchor` / `data-guide-process-lane` / `data-guide-process-label` attributes that the ProcessFlowOverlay reads to route its lines.

## Process Flow Overlay (`ProcessFlowOverlay`)

Desktop-only animated SVG that draws connector lines and nodes between section anchors as the user scrolls:

| Element | Style |
|---------|-------|
| Base path | `stroke: rgba(255,255,255,0.08)`, width 1.2, round caps/joins |
| Progress path | `stroke: rgba(252,184,16,0.88)` (yellow), width 1.45 |
| Completed path | `stroke: rgba(103,215,195,0.88)` (teal) |
| Nodes (pending) | `fill-[#181220] stroke-border` |
| Nodes (active) | `fill-yellow/16 stroke-yellow` + pulse `rgba(252,184,16,0.2)` |
| Nodes (complete) | `fill-teal/16 stroke-teal` + pulse `rgba(103,215,195,0.2)` |

The metaphor: **yellow = in progress, teal = done** — consistent with state colors everywhere else.

## Decorative Backdrops (`OrbitalBackdrop`)

Subtle orbital decoration inside bands — thin brand-tinted circles + faint radial washes:

```html
<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
  <div class="absolute -right-28 -top-28 h-96 w-96 rounded-full border border-yellow/10"></div>
  <div class="absolute bottom-12 left-10 h-72 w-72 rounded-full border border-dashed border-teal/10"></div>
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_62%_18%,rgba(252,184,16,0.12),transparent_30%),radial-gradient(circle_at_18%_78%,rgba(103,215,195,0.10),transparent_34%)]"></div>
</div>
```

Rules: 10–12% alpha max, yellow + teal only, always `pointer-events-none` + `aria-hidden`.

## Closing CTA Band (`ClosingSection`)

A tinted variant of the section band whose accent flips with completion state:

```html
<!-- pending -->
<section class="rounded-[34px] border border-yellow/30 p-7 shadow-panel backdrop-blur-[10px]
  bg-[linear-gradient(135deg,rgba(252,184,16,0.14),rgba(255,255,255,0.018)_44%,rgba(252,184,16,0.08))]">
<!-- complete: border-teal/45 + teal gradient -->
```

With the pill CTA (`rounded-full bg-yellow text-[#111016] hover:scale-[1.02]`, glow shadow) — full recipe in `ui-components.md`.

## Landing Rules

- Landings reuse **exactly** the app tokens — no separate marketing palette or fonts.
- Eyebrows on landings are **yellow** (in-app eyebrows are muted); `tracking-[0]`, uppercase, Poppins SemiBold.
- Show the product live (interactive mockups) instead of screenshots where possible.
- One narrative color story per page: yellow for progress/attention, teal for resolution. Red only for error walkthroughs.
- Alternate band header alignment (left/right) for rhythm; keep copy ≤ `max-w-2xl`/`max-w-3xl`.
- All decorative layers: `aria-hidden="true"`, `pointer-events-none`, reduced-motion fallbacks.
