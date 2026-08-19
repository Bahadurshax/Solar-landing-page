---
name: Solstice Energy
description: A residential solar landing page built as a single day, from first light to lit windows in the dark.
colors:
  low-sun: "#b08a53"
  low-sun-lifted: "#d5b16a"
  paper: "#fffdf8"
  ground: "#f8f6f1"
  ground-warm: "#f4efe4"
  ground-cool: "#f7f4ec"
  ink: "#121212"
  ink-warm: "#151310"
  night-blue: "#08111c"
  night-panel: "#0d1824"
  night-warm: "#100e09"
  night-deep: "#05060a"
  lit: "#f7eeda"
  lit-cool: "#f5f1e8"
  dusk-surface: "#e0cba4"
  warn: "#8f3a1e"
typography:
  display:
    fontFamily: "Albert Sans, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.4rem, 5.4vw, 5.6rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Albert Sans, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.9rem, 3.4vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Albert Sans, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.35rem, 1.65vw, 1.85rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Albert Sans, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(0.98rem, 1.15vw, 1.08rem)"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  lead:
    fontFamily: "Albert Sans, system-ui, -apple-system, sans-serif"
    fontSize: "19px"
    fontWeight: 650
    lineHeight: 1.22
    letterSpacing: "{track.title}"
  field:
    fontFamily: "Albert Sans, system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  control:
    fontFamily: "Albert Sans, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  ui:
    fontFamily: "Albert Sans, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  caption:
    fontFamily: "Albert Sans, system-ui, -apple-system, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "Albert Sans, system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.06em"
  brand:
    fontFamily: "Unbounded, Albert Sans, system-ui, sans-serif"
    fontWeight: 500
    letterSpacing: "0em"
rounded:
  hairline: "2px"
  sm: "6px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "14px"
  md: "26px"
  lg: "48px"
  section: "clamp(88px, 11vw, 168px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.lit-cool}"
    rounded: "11px"
    padding: "0 28px"
    height: "52px"
    typography: "{typography.label}"
  button-primary-night:
    backgroundColor: "{colors.lit-cool}"
    textColor: "{colors.ink}"
    rounded: "11px"
    padding: "0 28px"
    height: "52px"
  button-call:
    backgroundColor: "{colors.lit}"
    textColor: "{colors.night-warm}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.lit}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "46px"
  card-case:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "clamp(26px, 2.4vw, 38px)"
  card-process:
    backgroundColor: "{colors.night-panel}"
    textColor: "{colors.lit-cool}"
    rounded: "{rounded.md}"
  chip-region:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
---

# Design System: Solstice Energy

## Overview

**Creative North Star: "The Long Daylight"**

The system is a day passing. That is not a metaphor applied afterward — it is the literal structure of the code. Nearly every colour token in this project exists twice, once for morning and once for night, and the page opens on a house you can flip between the two. The About section then runs the full arc as a scrubbed timeline through four light stops, and the argument it makes by doing so is the product's actual argument: the ground goes dark and the windows stay lit.

Everything else follows from that. Surfaces here are not colours, they are light states, and the correct question when adding one is never "which cream" but "what hour is this". A section that resets to a neutral background because it is a new section has broken the system more than one that picks the wrong hex. Between the dusk of About and the morning of the testimonial wall sits a near-black band holding a phone number in lit ink; it works because it is 9pm, not because dark sections look premium.

The tone is plain and unornamented, and it is enforced by subtraction. Testimonials carry no ratings, no portraits, no quotation glyphs. The map is georeferenced rather than decorative. There is one accent colour and it is rationed. The restraint is not minimalism as a style — it is the belief that a specific fact outperforms a superlative, which is stated outright in the project's own source comments and should survive every future addition.

**Key Characteristics:**
- Every surface is an hour of the day, not a palette slot.
- One accent, used rarely and always load-bearing.
- Warm throughout: no neutral grey, no neutral black, no neutral shadow.
- Two weights of one typeface carry the whole page; the brand face appears on the brand only.
- Motion argues or it is cut — the test is whether it survives the narrow breakpoint.

## Colors

A warm, papery light-to-dark range with exactly one accent, all of it tinted off neutral.

### Primary
- **Low Sun** (#b08a53 on light grounds, #d5b16a on dark): The only accent in the system. It draws route lines on the region map, hairlines and active borders, the focus ring in the conversion band, and the footer's brand details. It lightens on dark ground so it holds the same visual weight at either hour — one colour with two light states, not two colours.

### Neutral — daylight
- **Paper** (#fffdf8): Raised surfaces that must read as lit — case cards, About panels, process card interiors. The lightest thing in the system.
- **Ground** (#f8f6f1): The default page floor under daylight sections.
- **Warm Ground** (#f4efe4) and **Cool Ground** (#f7f4ec): The About section's dawn floor and the testimonial wall's floor. Same role, a few degrees apart in temperature.
- **Dusk Surface** (#e0cba4): The About pan's third light stop. Not a background to reach for directly; it exists as a waypoint the timeline passes through.
- **Ink** (#121212) / **Warm Ink** (#151310): Body and display copy on any light ground. Warm Ink is the About section's, and is the correct choice on the warmer creams.

### Neutral — night
- **Night Blue** (#08111c) and **Night Panel** (#0d1824): The cool night pair, used where the page is still outdoors — the process card stage and its panels.
- **Warm Night** (#100e09): The conversion band's floor, carried directly from About's final light stop so the two surfaces meet without a seam.
- **Deep Night** (#05060a): The footer, the darkest surface in the system and the page's last frame.
- **Lit** (#f7eeda) / **Cool Lit** (#f5f1e8): Copy and lit elements on night grounds. Lit is the warm one and belongs with Warm Night and Deep Night; Cool Lit belongs with the Night Blue pair.

### Semantic
- **Warn** (#8f3a1e): The system's only state colour. It carries required-field marks and validation messages, and nothing decorative. It is a warm red-brown rather than a signal red specifically so it stays inside this palette — a pure red would be the second accent hue the One Sun Rule forbids. Added when the page gained its first form; before that the system had no error state because it had nothing to validate.

### Named Rules

**The Hour Rule.** A new surface picks its background by naming the hour it happens at, then taking the matching token. Sections do not get their own colours; they get positions in the day. If you cannot say what time it is, the section is not designed yet.

**The One Sun Rule.** Low Sun appears on well under a tenth of any screen and never as a fill for a large area. It marks the single active thing, the single route, the single hairline that matters. A second accent hue does not exist in this system; if something needs to stand out and gold is taken, the answer is weight, size, or a lit surface — not a new colour.

**The No Neutral Rule.** Nothing in this system is neutral grey or pure black. Secondary text is the foreground ink at reduced alpha so it keeps the surface's temperature; a grey at any opacity reads as dirt on these creams. Shadows follow the same rule (see Elevation).

## Typography

**Display Font:** Albert Sans (with system-ui, -apple-system, sans-serif)
**Body Font:** Albert Sans (same stack)
**Brand Font:** Unbounded (with Albert Sans fallback)

**Character:** One humanist sans doing everything, tracked tight and set large where it matters, with a single geometric display face reserved entirely for the name. The restraint is the character: the page never announces a section with a second typeface, so the only place the eye meets a different letterform is the word "Solstice".

The three display tokens (`--display-scale`, `--display-weight-delta`, `--display-tracking-delta`) are deltas rather than absolute values, and every display rule reads them inside a `calc()`. That is deliberate — the hero, the process cards and the case heading were each tracked by hand, and a single absolute value would flatten those relationships the moment anything touched it. Tune the system from those three; do not replace them with fixed numbers.

### Hierarchy
- **Display** (500, clamp(2.4rem, 5.4vw, 5.6rem), 1.02): The hero headline, the footer's closing line, and the conversion band's phone number. Reserved for the page's three or four genuine statements.
- **Headline** (500, clamp(1.9rem, 3.4vw, 3rem), 1.12): Section headings. Balanced wrapping.
- **Title** (400, clamp(1.35rem, 1.65vw, 1.85rem), 1.08): Card and panel titles.
- **Body** (400, `var(--text-body)` = clamp(1.08rem, 1.35vw, 1.25rem), 1.62): All running copy — 17.3px on a phone, 19.4px at 1440, 20px from 1481 up. Measure 65–75ch; the conversion band's lede is capped at 66ch. Every paragraph rule on the page reads the token rather than restating a size, so running copy moves as one thing. A section that sets its own body size is drift, not a decision; the hero's strip is the single documented exception, at 15px, because it is centred on a photograph inside a portrait frame.
- **Lead** (650, 19px, 1.22): A short assertion set above body weight but below display size — the How It Works claim rows are the case. It fills the gap between Body and the Title clamp's 21.6px floor, which is where a two-line promise wants to sit.
- **Field** (400, 16px, 1.4): Text the visitor types into — inputs, textareas, selects. **16px is a floor, not a preference.** Below it, iOS zooms the viewport on focus and the visitor loses the form they were part-way through. There is no case for a smaller input on this site.
- **Control** (600, 15px): Button and submit labels.
- **UI** (500, 14px): Form labels, small meta lines, and secondary interface text that is read rather than scanned.
- **Caption** (400, 13px, 1.45): Helper text, validation messages, and the smallest text that still has to be read comfortably.
- **Label** (500, 12px, 0.06em, often uppercase): Step numbers, stat labels, contact categories. The tracked, uppercase register — not a general small size.
- **Brand** (Unbounded 500): The wordmark and nothing else, at any size from the navbar to the footer monument.

The four small steps above (16 / 15 / 14 / 13) are the interface ramp, distinct from the display ramp's `clamp()` roles. They were added when the page gained its first real form; before that the system had a 12px tracked label and nothing between it and body copy, which is why parts of the incumbent code still sit off these steps.

### Named Rules

**The Brand Face Rule.** Unbounded sets the word "Solstice" and never another word. A heading, a button, a stat or a pull-quote in the brand face is a system violation regardless of how well it reads.

**The Answer Rule.** The phone number in the conversion band is set at the hero headline's scale on purpose: the hero asks and it answers. When a page element is the direct reply to another, match its scale rather than stepping down a level out of habit.

## Layout

Full-bleed sections stacked vertically, each owning a full viewport where the argument needs one. Section padding runs `clamp(88px, 11vw, 168px)` vertically and `clamp(20px, 5vw, 56px)` horizontally. Content columns cap at 880–1040px inside those full-bleed grounds; the open ground either side of a narrow column is a deliberate part of the composition, not wasted space.

Spacing rhythm escalates rather than repeats: ~3px inside a label pair, 14px between an icon and its text, 26px between siblings in a group, 48px+ between groups. Within-group and between-group intervals should be visibly different — matching them means proximity is doing no work.

Three sections use scroll-pinned sequences (the process stage, the About pan, the closing push). Those are the system's cinematic moments and they are rationed; a fourth would make the page a slideshow.

Breakpoints are defined once in `src/breakpoints.js` and mirrored in the stylesheets, because CSS cannot read a value out of a module. The pairs: 1024/1025 for the nav swap, 768/769 for the pinned card stage, 900/901 for the wall and the About pan. Every `@media` that pairs with one carries a comment naming its twin. Do not introduce a fourth breakpoint without adding it there.

## Elevation & Depth

Depth in this system is **contact, not lift**. Every shadow carries a large negative spread — `0 26px 56px -30px rgba(96, 74, 38, 0.55)` is typical — which pulls the shadow back under the element rather than letting it bloom around it. The result reads as an object resting on warm ground, not floating above it. Shadows are always tinted from the surface beneath (browns, ambers, warm blacks), never neutral.

The system layers tonally as much as it shadows: a lit panel on a dusk ground separates by light, not by elevation. Reach for a lighter surface before reaching for a bigger shadow.

### Shadow Vocabulary
- **Contact, small** (`box-shadow: 0 8px 18px -12px rgba(120, 88, 40, 0.45)`): Chips, small controls, anything resting lightly.
- **Contact, card** (`box-shadow: 0 20px 38px -26px rgba(120, 88, 40, 0.55)`): Case cards and About panels at rest.
- **Contact, deep** (`box-shadow: 0 40px 90px -50px rgba(58, 40, 14, 0.55)`): The largest raised surfaces, where the drop needs to read across a full section.
- **Night contact** (`box-shadow: 0 14px 34px -16px rgba(0, 0, 0, 0.9)`): The same idea on a night ground, where the tint is carried by the darkness itself.
- **Inset hairline** (`box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.07)`): A lit edge on dark panels, used instead of a border so the panel keeps its own corner radius cleanly.

### Named Rules

**The Contact Rule.** Every shadow's blur exceeds its offset and its spread is negative. A shadow with zero or positive spread, or with a neutral colour, does not belong to this system — it will read as a generic card drop against these warm grounds.

## Shapes

Corners are gentle and consistent: 12px on panels and process cards, 16px on the larger content cards, 22–24px on the biggest containers, 6px on small controls. Pills (999px) are reserved for things you act on — buttons, filter chips, the toggle, the contact actions — so roundness itself signals interactivity.

Borders are hairlines and nothing heavier: 1px, always at low alpha, always tinted from the ink or the accent rather than from grey. Circles appear only for genuinely circular objects — map pins, rail nodes, icon capsules — never as decorative bullets.

The footer's monument wordmark is deliberately clipped by the bottom edge of its container. That clipping is the effect: a wordmark that fits inside its frame is a logo, and one that does not is a building.

## Components

### Buttons
- **Shape:** 11px radius on the navbar CTA; pill (999px) on the conversion band and all filter controls.
- **Primary (daylight):** Ink fill (#121212), Cool Lit text, 52px tall, 28px horizontal padding, 12–14px label at weight 600.
- **Primary (night):** Inverts to a Cool Lit fill with Ink text. Same geometry — the button does not change shape when the hour changes, only its light.
- **Call action:** Lit fill (#f7eeda) on a night ground with Warm Night text, pill, 52px, carrying the Night contact shadow.
- **Ghost / secondary:** Transparent with a 1px hairline at ~16% alpha, Lit text at ~62%. Border and text both rise toward full on hover.
- **Hover:** A 2px lift with an exponential ease-out, or a brightness nudge. Never a colour change into a new hue.
- **Focus:** A 2px Low Sun ring at 3–4px offset. Required on every control that sits over a photograph.

### Chips
- **Style:** Pill, transparent, 1px Low Sun hairline at 24% alpha, ink text.
- **Selected:** Hairline rises to 45% alpha and the chip takes the small contact shadow. Selection is never carried by colour alone.

### Cards / Containers
- **Corner Style:** 16px on case and quote cards, 12px on process cards.
- **Background:** Paper (#fffdf8) on daylight grounds; Night Panel (#0d1824) on the process stage.
- **Shadow Strategy:** Contact-card at rest, deepening on hover. See Elevation.
- **Border:** A 1px hairline at low alpha on light cards; an inset lit hairline on dark ones.
- **Internal Padding:** clamp(26px, 2.4vw, 38px).

### Navigation
- Inline links at body scale in ink at ~64% alpha, rising to full on hover, with the brand mark at the left and a single CTA at the right. Below 1025px the six links collapse entirely into a burger that opens a full portal panel; the CTA never collapses, because it is the page's primary action.

### Marquee wall
Two rows running in opposite directions at deliberately unequal speeds (21s and 24s). The inequality matters: matched speeds read as one object hinged down the middle rather than as two. The loop timing function must stay linear, and a row pauses on hover of the row under the pointer, so the wall keeps moving while one strip holds still to be read. Neither duration may be raised far: below roughly one pixel of travel per frame a composited row of text is snapped to the pixel grid and the motion reads as stepping rather than as slowness.

### Region map
A georeferenced bitmap with an SVG route overlay in the image's own pixel coordinates and an HTML pin layer above it. Pins are real buttons so they carry focus rings. Coordinates are projected from true latitude and longitude through two fitted anchor points — no pin is placed by eye, and re-cropping the bitmap means retuning two constants rather than nudging six pins.

## Do's and Don'ts

### Do:
- **Do** pick a new surface's background by naming the hour it happens at, then taking that token (The Hour Rule).
- **Do** tint every secondary text colour from the foreground ink at reduced alpha, so it keeps the surface's temperature.
- **Do** give every shadow a negative spread and a warm tint (The Contact Rule).
- **Do** ration Low Sun to the single active element, route, or hairline that matters (The One Sun Rule).
- **Do** tune display type through `--display-scale`, `--display-weight-delta` and `--display-tracking-delta` rather than editing rules individually.
- **Do** theme the surfaces the browser would otherwise own — selection, focus rings, tabular figures on numeric data.
- **Do** test a new motion idea by asking whether it survives the narrow breakpoint. If cutting it loses nothing, it was decoration.

### Don't:
- **Don't** set anything other than the word "Solstice" in Unbounded (The Brand Face Rule).
- **Don't** introduce a second accent hue. Use weight, scale, or a lit surface instead.
- **Don't** use neutral grey, pure black, or a neutral shadow anywhere (The No Neutral Rule).
- **Don't** add a fourth scroll-pinned sequence. Three is the ration; a fourth turns the page into a slideshow.
- **Don't** give a section a background colour because it is a new section. That is the most common way to break the day.
- **Don't** add ratings, portraits, logos, or quotation glyphs to testimonials. Their plainness is the argument.
- **Don't** place a map pin, a route, or a coordinate by eye. The geography is real and stays real.
- **Don't** animate a layout property (width, height, margin, flex-basis) where a transform expresses the same change.
