# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # production build to dist/
npm run preview  # serve the built dist/
npm run lint     # eslint over the repo
```

There is no test suite and no test runner. Verification here is visual: run the
dev server and drive the page (the Playwright MCP tools are pre-allowed in
`.claude/settings.local.json`). `npm run build` is the only mechanical check
beyond lint.

## What this is

A single-page marketing site for a fictional residential solar installer
("Solstice Energy"), React 19 + Vite, no backend and no router. Read
`PRODUCT.md` before changing copy or content — in particular: **all content is
invented** (case studies, testimonials, stats, contact details) and freely
rewritable, except `src/data/region-map.js`, whose coordinates are real and
projected from true lat/lon. English-only is a deliberate decision, not a defect.

`DESIGN.md` is the design system of record for rules and rationale, **but its
YAML frontmatter palette is stale** — the shipping palette is the twelve
`--sol-*` "Eclipse" tokens at the top of `src/styles.css`. Trust the stylesheet
for values, `DESIGN.md` for the named rules (Hour Rule, One Sun Rule, No Neutral
Rule, Contact Rule, Brand Face Rule).

## Architecture

### The page is one vertical scroll composition

`App.jsx` renders the section sequence directly — hero, `HowItWorks`,
`FilmReveal`, `OurCasesSection`, `AboutSection`, `QuoteBand`,
`ClosingSequence`, plus a fixed `ContactDock`. Two nestings are load-bearing
rather than incidental:

- `ClosingSequence` owns **both** `TestimonialsSection` and `SiteFooter`,
  because the footer arriving is one pinned move that displaces the wall. They
  cannot be separated back into siblings.
- `Navbar` owns `MobileMenu`; `OurCasesSection` owns the map/filters/cards/stats.

Every section stylesheet is imported by its own component (`src/styles/*.css`);
only `src/styles.css` — tokens plus hero — is imported by `main.jsx`.

### Scroll is shared infrastructure, not per-component

Four modules at `src/` root, and the order they start in `App.jsx` matters:

- `smoothScroll.js` — one page-wide Lenis instance behind `getLenis()`,
  driven by the GSAP ticker (`autoRaf: false`, `lagSmoothing(0)`), feeding
  `ScrollTrigger.update`. Anything that moves the page on purpose must go
  through `scrollTo()` here; a raw `window.scrollTo` is overwritten by Lenis on
  the next frame. `pauseSmoothScroll`/`resumeSmoothScroll` for anything that
  takes the scroll over.
- `sectionSnap.js` — the single snapped seam on the page (quote band →
  testimonial wall). Started *after* smooth scroll, because it moves the page
  through Lenis. Deliberately the only one.
- `scrollCoordinator.js` — the page's one scroll listener. Subscribe with
  `onScroll(fn)` (coalesced to one frame, one shared `y`/`delta`/`velocity`)
  and `onMeasure(fn)` (runs on resize, font settle, and every
  `ScrollTrigger.refresh()`). **Never read layout inside an `onScroll`
  callback** — measure in `onMeasure`, cache, spend the cache per frame. This
  file exists to undo exactly that mistake.
- `App.jsx` owns the page's single `ScrollTrigger.refresh()` after load and
  `document.fonts.ready`. `refresh()` is global — do not add per-section ones.

`useGSAP` + `gsap.matchMedia()` is the pattern in the four pinning components
(`HowItWorks`, `AboutSection`, `TestimonialsSection`, `ClosingSequence`); each
registers `ScrollTrigger` itself.

### Breakpoints and reduced motion

`src/breakpoints.js` is the single JS source for media queries. CSS cannot read
it, so each stylesheet keeps a mirrored `@media` with a comment naming its
twin — change one, change both. Do not introduce a fourth breakpoint pair
(1024/1025 nav, 768/769 pinned stage, 900/901 wall + About pan) without adding
it there.

Reduced-motion handling is unusually thorough and is a maintained feature:
smooth scroll and snapping do not start at all under `NO_MOTION`, and the
`*_STAGE` queries fold it into the pin conditions. `App.jsx` keys the scroll
effects on the preference so toggling mid-session tears them down.

### Images

Hero plates live in `public/images/` and are referenced by **literal path**, not
imported — `index.html` preloads them, and the same files are reused by Our
Cases and the footer, so bundling them would create a second hashed URL and a
second multi-MB download. Consequence: no content hash, so **rename the file if
a photo is re-shot**. `reference/` holds unpublished source material (sharp
originals of the blurred back plates, design labs) precisely because `public/`
ships verbatim.

### Build

`vite.config.js` splits vendor chunks (react / gsap / motion / lenis) for cache
granularity, not deferral — nothing is lazily loaded and that was a measured
decision. It also strips `<!-- impeccable-live-* -->` blocks from the production
HTML, because that tooling injects a localhost script into the tracked
`index.html` and it once shipped.

## Design tooling in this repo

`.claude/skills/` (and `.agents/`, `.codex/` mirrors) vendor the `impeccable`
design-detector skill; `.claude/settings.local.json` wires it as PostToolUse and
Stop hooks, so edits to UI files trigger design checks. `.impeccable/config.json`
records per-value rule exemptions with reasons — when a check flags a colour or
radius that is a deliberate exception, add it there with the reasoning rather
than changing the design. Those directories are excluded from lint.
