# Variant A — “How It Works” Section Prompt

Create a premium, scroll-driven **“How It Works” section** for a residential solar-energy landing page using React, Vite, GSAP, and ScrollTrigger. Use plain CSS only—no Tailwind. Recreate the editorial Variant A design: a wide fixed information column on the left and four tall cinematic process cards that overlap and stack while the user scrolls.

## Stack

- React 19
- Vite
- `gsap`
- `@gsap/react`
- `gsap/ScrollTrigger`
- `lucide-react`
- Plain CSS

## Provided image references

Use the following generated assets exactly as the visual sources for this section. Do not replace them with placeholders, stock photos, gradients, or newly generated alternatives.

| Purpose | Conversation file reference | Source filename | Recommended project path |
|---|---|---|---|
| Card 1 — daytime solar house | `file_00000000bbc481f4b69f7b08a0c247d6` | `/mnt/data/современный_дом_с_солнечной_крышей.png` | `src/assets/solar-capture-day.png` |
| Card 2 — smart energy controller | `file_00000000b6b481f4a2d72db3d9704b1b` | `/mnt/data/белое_устройство_в_минималистичном_пространстве.png` | `src/assets/smart-controller.png` |
| Card 3 — nighttime solar house | `file_00000000a0248246a0547e3b702f7f7c` | `/mnt/data/современный_дом_с_солнечными_панелями.png` | `src/assets/solar-home-night.png` |
| Inline heading image | `file_00000000663c8243b19782d503359d75` | `/mnt/data/панорамная_солнечная_крыша_на_закате.png` | `src/assets/solar-heading-detail.png` |

Assume the files are copied into `src/assets/` using the recommended project filenames.

Use these exact paths in the React implementation:

```js
const assets = {
  headingDetail: "/images/solar-heading-detail.png",
  captureDay: "/images/solar-capture-day.png",
  controller: "/images/smart-controller.png",
  homeNight: "/images/solar-home-night.png"
};
```

Do not alter the core content or geometry of the assets. Cropping through `object-fit: cover` is allowed, but avoid aggressive cropping that removes the solar panels, product, house entrance, or architectural context.

## Visual direction

- Premium residential solar-energy brand
- Minimal editorial composition
- Warm off-white background
- Large black typography
- Cinematic solar-panel and residential-energy imagery
- Four vertically oriented process cards
- Smooth pinned scrolling and physical card stacking
- No generic feature-card grid
- No excessive rounded pills
- No labels such as `"SECTION 01"` or `"FEATURE 02"`
- Spacious, architectural, high-end visual language

## Typography

Use **Satoshi** or **Geist**, not Inter.

Font weights:

- 400
- 500
- 600

Core colors:

```css
:root {
  --section-bg: #f4f0e9;
  --panel-bg: #f7f4ee;
  --text-primary: #111111;
  --text-secondary: rgba(17, 17, 17, 0.64);
  --text-muted: rgba(17, 17, 17, 0.38);
}
```

## Section layout

Create a section with a total scroll length of approximately `380vh`.

The visible pinned viewport must occupy:

```css
min-height: 100svh;
```

Desktop layout:

- 12-column grid
- Left editorial panel: 4 columns
- Card stage: 8 columns
- Gap: approximately `48px`
- Outer horizontal padding: `clamp(24px, 3vw, 56px)`
- Vertical padding: approximately `32px`
- Use the full viewport width
- Wrap the page in `overflow-x: hidden`

The entire visual section remains pinned while the user scrolls through four process states.

## Left editorial panel

The left panel remains visually fixed throughout the pinned sequence.

### Introduction

Display:

```text
HOW IT WORKS
```

Styling:

- Font-size: `12px`
- Font-weight: 500
- Letter-spacing: `0.1em`
- Uppercase
- Dark gray

### Heading

Use this exact heading:

```text
From sunlight
to certainty.
```

Keep it on exactly two lines on desktop.

```css
font-size: clamp(3.4rem, 4.5vw, 5.4rem);
font-weight: 400;
line-height: 0.96;
letter-spacing: -0.055em;
max-width: 560px;
```

Embed the provided panoramic solar-panel image directly inside the second line between `"to"` and `"certainty."`

```jsx
<h2>
  From sunlight
  <br />
  to
  <span
    className="heading-image"
    aria-hidden="true"
    style={{
      backgroundImage: `url(${assets.headingDetail})`
    }}
  />
  certainty.
</h2>
```

Inline image styling:

- Width: `96–120px`
- Height: `44–52px`
- Border-radius: `999px`
- `display: inline-block`
- `vertical-align: middle`
- Margin-inline: `12px`
- `background-size: cover`
- `background-position: center`
- Slightly increase contrast and saturation
- Do not add visible borders or labels

### Supporting text

Use:

```text
Your system captures, controls and distributes clean energy while protecting your electricity costs for seven years.
```

Styling:

- Maximum width: `340px`
- Font-size: `15px`
- Line-height: `1.55`
- Secondary text color
- Margin-top: `28px`

### Benefit list

Show three restrained rows with icons from `lucide-react`:

1. `Sun`
   - `Clean energy, captured efficiently`

2. `Battery`
   - `Smart control, optimized constantly`

3. `ShieldCheck`
   - `Guaranteed $0 bills for seven years`

Each row:

- Icon inside a minimal `28px` circular outline
- Text size: `13px`
- Line-height: `1.35`
- Gap: `14px`
- Vertical separation: `22px`
- No card background

### Vertical progress rail

Place the progress rail along the right edge of the editorial panel.

Nodes:

```text
01
02
03
04
```

Inactive state:

- Circle: `8px`
- Transparent center
- `2px` border using `rgba(0,0,0,0.2)`
- Number opacity: `0.35`

Active state:

- Circle: `10px`
- Black fill
- Small warm-white center dot
- Number opacity: `1`

Connect the nodes with a thin vertical line. Animate the active fill continuously from top to bottom according to scroll progress.

## Card stage

The right side contains four tall process cards arranged horizontally.

Desktop stage:

- Height: `calc(100svh - 48px)`
- `display: flex`
- `align-items: stretch`
- `overflow: visible`
- `position: relative`

Approximate widths:

- Card 1: `27%`
- Card 2: `23%`
- Card 3: `27%`
- Card 4: `23%`

Cards slightly overlap:

```css
.process-card + .process-card {
  margin-left: -18px;
}
```

Each successive card must have a higher z-index.

Use restrained corner rounding:

```css
border-radius: 10px 10px 0 0;
```

Every card contains:

- Small number near the top
- Large title
- Short description
- Full-height image or dark visual field
- Bottom `"Learn more"` interaction
- Circular arrow button

Keep text within the upper 30% of the card.

## Card 1 — Capture sunlight

Use `assets.captureDay`.

Number:

```text
01
```

Title:

```text
Capture
sunlight
```

Description:

```text
High-efficiency solar panels capture more of what matters most—the sun.
```

Image treatment:

```css
object-fit: cover;
object-position: 48% center;
```

Overlay:

```css
linear-gradient(
  to bottom,
  rgba(36, 71, 88, 0.28) 0%,
  rgba(17, 30, 37, 0.04) 48%,
  rgba(8, 14, 18, 0.45) 100%
);
```

Text color: white.

Preserve the rooftop panels, garage, entrance, and warm architectural light.

## Card 2 — Control every watt

Use `assets.controller`.

Number:

```text
02
```

Title:

```text
Control
every watt
```

Description:

```text
Our Smart Controller manages and optimizes energy flow in real time.
```

Image treatment:

```css
object-fit: cover;
object-position: center center;
```

Overlay:

```css
linear-gradient(
  to bottom,
  rgba(25, 25, 25, 0.04),
  rgba(20, 20, 20, 0.26)
);
```

Text color: white.

Keep the controller large and visible in the lower half. Preserve the soft architectural shadows and minimal gray environment.

## Card 3 — Power the whole home

Use `assets.homeNight`.

Number:

```text
03
```

Title:

```text
Power
the whole home
```

Description:

```text
Energy powers everything that matters—day, night, and every moment in between.
```

Image treatment:

```css
object-fit: cover;
object-position: 48% center;
```

Overlay:

```css
linear-gradient(
  to bottom,
  rgba(6, 18, 30, 0.35),
  rgba(3, 10, 18, 0.7)
);
```

Text color: white.

Keep the illuminated windows, solar panels, entrance, and dark blue sky visible.

## Card 4 — Lock in $0 bills

Number:

```text
04
```

Title:

```text
Lock in
$0 bills
```

Description:

```text
Lock in $0 electricity bills for the next seven years. Guaranteed.
```

Background:

```css
background:
  radial-gradient(
    circle at 50% 55%,
    rgba(255, 255, 255, 0.08),
    transparent 42%
  ),
  linear-gradient(145deg, #202020 0%, #080808 100%);
```

Central value:

```text
$0
```

Value styling:

- Font-size: `clamp(4rem, 6vw, 7rem)`
- Font-weight: 400
- Warm gray or off-white
- Letter-spacing: `-0.06em`

Caption:

```text
Electricity Bills
for 7 years
```

Display a thin `ShieldCheck` outline icon below the caption.

## Bottom card interaction

Each card includes:

- Left: `"Learn more"`
- Right: circular `ArrowRight` button
- Button diameter: `36px`
- Thin visible border
- Strong contrast against the card

Hover behaviour:

- Image scale: `1` to `1.045`
- Duration: `700ms`
- Ease: `power3.out`
- Arrow translates `3px` right
- Circular button background becomes more opaque
- Card title moves upward by `3px`
- Do not scale the card container itself

## ScrollTrigger setup

Register the plugin:

```jsx
gsap.registerPlugin(ScrollTrigger);
```

Use `useGSAP` from `@gsap/react`.

Recommended structure:

```jsx
<section ref={sectionRef} className="how-it-works">
  <div ref={pinRef} className="how-it-works__viewport">
    <EditorialPanel />
    <CardStage />
  </div>
</section>
```

Create a pinned timeline:

```jsx
ScrollTrigger.create({
  trigger: sectionRef.current,
  start: "top top",
  end: "+=300%",
  pin: pinRef.current,
  scrub: 1,
  anticipatePin: 1,
  invalidateOnRefresh: true
});
```

## Card-stacking animation

Cards must already be fully composed when the section enters view.

As the user scrolls, each card becomes dominant in sequence.

Active card:

- `y: -24px`
- Scale from `0.94` to `1`
- Opacity from `0.45` to `1`
- Image overlay becomes lighter
- Text opacity reaches `1`

Previously active cards:

- Move slightly farther upward
- Scale to approximately `0.97`
- Opacity falls to `0.25–0.35`
- Apply optional `brightness(0.65)`
- Keep their edges visible behind the active card

Future cards:

- Remain slightly lower
- Scale around `0.93`
- Opacity around `0.4`

Tie every transition to scroll progress with `scrub`. Do not use abrupt snapping.

## Horizontal drift

Subtly move the card stage so the active card approaches the visual center of the right stage.

- Maximum movement: `6–10vw`
- Never move cards outside the viewport
- Never create a horizontal scrollbar
- Use measured card offsets or calculated `xPercent`

## Entrance animation

When the section initially enters:

- Introduction fades in
- Heading reveals upward through an overflow mask
- Inline heading image scales from `0.7` to `1`
- Description rises from `y: 20`
- Benefit rows appear with `0.08s` stagger
- Progress rail draws downward

Use:

```js
duration: 1;
ease: "power3.out";
```

Do not replay these animations while the active card changes.

## Scroll-scrubbed paragraph reveal

Split the supporting paragraph into words.

Initial word opacity:

```css
opacity: 0.15;
```

Reveal the words sequentially during the first 20% of section progress.

Keep the effect subtle and readable.

## Pointer parallax

Desktop only.

The image inside the active card reacts to pointer position:

- Maximum `x`: `±6px`
- Maximum `y`: `±5px`

Use `gsap.quickTo`.

Do not move the text or card shell. Reset smoothly on pointer leave. Disable on touch devices.

## Morning/Night theme integration

The section must respond to the landing page’s existing mode state.

Morning:

```css
--section-bg: #f4f0e9;
--panel-bg: #f7f4ee;
--text-primary: #111111;
--text-secondary: rgba(17,17,17,0.64);
```

Night:

```css
--section-bg: #08111c;
--panel-bg: #0d1824;
--text-primary: #f5f1e8;
--text-secondary: rgba(245,241,232,0.68);
```

On mode change:

- Animate background and text colors over `0.6s`
- Preserve all layout dimensions and card positions
- Do not replay the scroll sequence
- Do not regenerate or geometrically alter the supplied images

## Responsive behaviour

### Desktop: above 1024px

- Full pinned two-column layout
- Four tall overlapping cards
- Vertical progress rail
- Scroll stacking enabled
- Pointer parallax enabled

### Tablet: 768–1024px

- Left panel: approximately `36%`
- Card stage: approximately `64%`
- Reduce heading size
- Reduce card overlap
- Keep pinning
- Disable pointer parallax when needed for performance

### Mobile: below 768px

Disable the pinned desktop composition.

Use normal document flow:

1. Introduction
2. Wide heading
3. Description
4. Horizontal progress rail
5. Four vertically stacked cards

Mobile cards:

- Width: `100%`
- Minimum height: `72svh`
- Margin-bottom: `20px`
- No horizontal overlap
- Border-radius: `12px`
- Image fills the card

Animate each card as it enters:

```js
from: {
  y: 60,
  scale: 0.9,
  opacity: 0
},
to: {
  y: 0,
  scale: 1,
  opacity: 1
}
```

Use individual `ScrollTrigger` instances.

Update the active progress marker based on the card nearest the viewport center.

## Accessibility

- Use semantic `<section>`, `<article>`, `<button>`, and heading elements
- Provide useful `alt` text for all three main images
- Mark the inline heading image with `aria-hidden="true"`
- Give arrow buttons explicit accessible labels
- Provide visible keyboard focus styles
- Do not rely only on color to communicate the active step
- Respect `prefers-reduced-motion`

Reduced-motion behaviour:

- Disable pinning
- Disable stacking
- Disable pointer parallax
- Show all cards in normal flow
- Keep only simple `200ms` opacity transitions

## Suggested component structure

```text
src/
  App.jsx
  components/
    HowItWorks.jsx
    EditorialPanel.jsx
    ProcessCard.jsx
    ProgressRail.jsx
  styles/
    how-it-works.css

public/
  images/
    solar-heading-detail.png
    solar-capture-day.png
    smart-controller.png
    solar-home-night.png
```

## Quality requirements

- Build the complete working React section
- Use the supplied image references
- Use real GSAP and ScrollTrigger logic
- Do not imitate stacking using CSS transitions alone
- Keep the heading within two lines on desktop
- Maintain strong button contrast
- Prevent horizontal overflow
- Avoid excessive cards, badges, pills, and decorative UI
- Avoid narrow text columns
- Do not leave empty regions in the layout
- Keep animation fluid and performance-conscious
- The final result should feel like a premium, award-level product story rather than a standard SaaS feature section
