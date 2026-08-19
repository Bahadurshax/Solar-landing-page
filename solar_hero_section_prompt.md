# Solar Energy Hero Section Prompt

Create a full-screen hero section for a residential solar-energy landing page using React, Vite, and Framer Motion (`motion` package). Use plain CSS only—no Tailwind. The design should closely resemble a premium architectural energy website: a full-viewport house image, centered headline, minimal navigation, and a Morning/Night toggle near the bottom.

**Stack:** React 19, Vite, `motion` from `motion/react`, `lucide-react`.

## Visual direction

- Premium residential solar-energy brand
- Full-screen photorealistic background showing a modern detached house with rooftop solar panels
- Minimal typography and navigation
- Day and night versions must show the exact same house, camera position, framing, landscaping, solar-panel placement, and perspective
- The only differences between the two background assets are lighting, sky, window illumination, shadows, and environmental color temperature
- No visible layout movement when switching modes
- Desktop-first composition with a responsive mobile layout

## Assets

- Day background: `/src/assets/solar-house-day.png`
- Night background: `/src/assets/solar-house-night.png`
- Both images must have:
  - Identical dimensions and aspect ratio
  - Identical composition and crop
  - The house positioned in exactly the same location
  - The same camera angle and focal length
  - The same solar-panel arrangement
  - The same trees, driveway, windows, plants, roof structure, and architectural details
- Use `object-fit: cover`
- Use the same `object-position: center center` for both assets
- Never apply different scale, crop, or positioning between modes

## Page layout

- Full viewport hero: `min-height: 100svh`
- Position: relative
- Overflow: hidden
- Background layers fill the entire viewport
- Content is arranged vertically:
  1. Navbar at the top
  2. Main headline around the upper-middle area
  3. Mode toggle and supporting copy near the bottom
- All interface content sits above the background with appropriate z-index values

## Background treatment

- Render each background as an absolutely positioned full-screen layer
- Apply a subtle overlay for readability:
  - Morning: soft warm translucent overlay, approximately `rgba(245, 239, 222, 0.12)`
  - Night: subtle dark blue overlay, approximately `rgba(3, 11, 24, 0.28)`
- Add a faint bottom gradient to improve readability around the toggle and description
- Do not blur the image
- Preserve realistic solar-panel texture and architectural detail

## Navbar

- Fixed or absolutely positioned at the top
- Width: 100%
- Height: approximately 72–80px on desktop
- Padding:
  - Desktop: `18px 28px`
  - Mobile: `14px 16px`
- Display: flex
- Align-items: center
- Justify-content: space-between
- z-index: 40

### Navbar left

- Brand logo consisting of:
  - A minimal lightning-bolt-style SVG icon
  - Brand name: `"reposit"` or `"Solstice"`
- Logo icon size: approximately 34px
- Brand text:
  - Font-size: 24px
  - Font-weight: 600
  - Letter-spacing: `-0.04em`

### Navbar center

- Horizontal navigation links:
  - `"How It Works"`
  - `"Our Cases"`
  - `"About Us"`
  - `"Careers"`
  - `"Resources"`
  - `"Customers"`
- Gap: approximately 34–42px
- Font-size: 13–14px
- Font-weight: 500
- Hide the center navigation below 900px

### Navbar right

- Rounded CTA button
- Text: `"Get an Instant Quote"`
- Desktop height: approximately 52px
- Horizontal padding: 28px
- Border-radius: 10–12px
- Morning mode:
  - Black background
  - White text
- Night mode:
  - Off-white background
  - Black text
- Include a subtle hover scale and brightness interaction

## Adaptive interface colors

- Morning mode:
  - Logo and navigation text: near-black
  - CTA: black with white text
- Night mode:
  - Logo and navigation text: off-white
  - CTA: off-white with black text
- Animate interface colors over `0.45s`
- Use CSS variables controlled by the active mode

## Main headline

- Centered horizontally
- Positioned approximately 15–20% below the navbar
- Maximum width: 850–950px
- Text:
  - Line 1: `"$0 Electricity Bills"`
  - Line 2: `"for the next 7 years"`
- Font:
  - Use `"Inter"` or `"Manrope"` from Google Fonts
  - Weights: 400, 500, 600
- Desktop font-size: `clamp(3.5rem, 5.8vw, 6rem)`
- Mobile font-size: `clamp(2.4rem, 10vw, 4rem)`
- Line-height: `0.95`
- Letter-spacing: `-0.055em`
- Text-align: center
- Font-weight: 500

## Headline color treatment

- Use two contrasting color groups rather than a single flat color
- Morning mode:
  - `"$0 Electricity Bills"`: dark charcoal
  - `"for the next"`: white or warm off-white
  - `"7 years"`: dark charcoal
- Night mode:
  - `"$0 Electricity Bills"`: warm off-white
  - `"for the next"`: near-black or dark navy
  - `"7 years"`: warm off-white
- Animate text colors smoothly when the mode changes
- Add only a very subtle text shadow where needed for readability

## Bottom controls

- Position near the bottom center
- Bottom offset:
  - Desktop: approximately 80–105px
  - Mobile: approximately 65–85px
- Display as a vertical stack
- Center-align all content
- z-index: 30

## Morning/Night segmented toggle

- Width: approximately 400px on desktop
- Width on mobile: `calc(100vw - 40px)`, max-width 400px
- Height: 66–72px
- Display: grid with two equal columns
- Border-radius: 10px
- Overflow: hidden
- Background: translucent dark or light glass depending on the active mode
- Use `backdrop-filter: blur(10px)`
- Include a subtle border:
  - Morning: `rgba(0,0,0,0.1)`
  - Night: `rgba(255,255,255,0.14)`

Each toggle option contains:

- Main label:
  - `"Morning"` or `"Night"`
  - Font-size: 18px
  - Font-weight: 600
- Secondary label:
  - `"$0 for Electricity"`
  - Font-size: 12px
  - Opacity: 0.65
- Entire option is clickable
- Use semantic buttons
- Include visible keyboard focus styles

## Active toggle indicator

- Use a separate animated background panel behind the active option
- Morning active state:
  - Warm off-white background
  - Dark text
- Night active state:
  - Warm off-white background
  - Dark text
- Inactive option:
  - Transparent background
  - Color adapted to the current background mode
- Animate the indicator horizontally using a spring:
  - `type: "spring"`
  - `stiffness: 260`
  - `damping: 26`
  - `mass: 0.8`

## Supporting description

- Place below the toggle
- Maximum width: 720px
- Margin-top: 14–18px
- Text:

  `"Forget the energy market, weather conditions and seasons; our Smart Controller guarantees you get no electricity bill for seven years."`

- Font-size:
  - Desktop: 15px
  - Mobile: 13px
- Line-height: 1.5
- Morning mode: dark text with approximately 75% opacity
- Night mode: off-white text with approximately 82% opacity
- Center-aligned

## Background mode-switch animation

- The background must not use a standard crossfade
- The incoming image should slide vertically downward from above, like a large visual panel dropping into place
- Add a slight physical bounce when it reaches its final position
- The house must remain aligned between both assets throughout the transition
- Since the two image assets are geometrically identical, the transition should appear as the same scene changing from morning to night

Implement with `AnimatePresence` and a keyed `motion.div` or `motion.img`:

```jsx
<AnimatePresence initial={false} mode="sync">
  <motion.div
    key={mode}
    className="background-layer"
    initial={{ y: "-105%" }}
    animate={{ y: "0%" }}
    exit={{ y: "8%", opacity: 0.96 }}
    transition={{
      y: {
        type: "spring",
        stiffness: 105,
        damping: 18,
        mass: 0.9,
        bounce: 0.22
      },
      opacity: {
        duration: 0.35
      }
    }}
  />
</AnimatePresence>
```

## Drop animation behaviour

- New image begins completely above the viewport
- It moves vertically downward over the existing image
- It briefly overshoots its final position by approximately 8–12px
- It then settles back into `y: 0`
- The bounce must be subtle, not cartoonish
- Total perceived duration: approximately 0.8–1.05 seconds
- Keep the current image visible underneath until the incoming layer covers it
- Do not scale, rotate, blur, or horizontally move either image
- Do not animate `object-position`
- Disable pointer events on background layers
- Prevent rapid repeated toggling from producing stacked or broken animations

## Optional manual keyframe version for tighter control

```jsx
animate={{
  y: ["-105%", "1.2%", "-0.35%", "0%"]
}}
transition={{
  duration: 0.92,
  times: [0, 0.78, 0.9, 1],
  ease: [
    [0.22, 1, 0.36, 1],
    [0.2, 0.8, 0.2, 1],
    [0.25, 1, 0.5, 1]
  ]
}}
```

Use either the spring or keyframe approach, but not both simultaneously.

## Other animations

- Navbar initial load:
  - `y: -20`
  - `opacity: 0`
  - Animate to visible
  - Duration: 0.8s
  - Ease: `[0.16, 1, 0.3, 1]`
- Headline:
  - Start at `y: 24`, opacity 0
  - Duration: 0.9s
  - Delay: 0.15s
- Bottom toggle:
  - Start at `y: 20`, opacity 0
  - Duration: 0.8s
  - Delay: 0.35s
- Supporting text:
  - Start at `y: 14`, opacity 0
  - Delay: 0.5s
- When switching modes, animate headline and interface colors without replaying entrance animations

## Interaction details

- Default state: `"morning"`
- Clicking `"Morning"` switches to the day image
- Clicking `"Night"` switches to the night image
- Ignore clicks on the already active mode
- Temporarily lock the mode buttons while the drop transition is running
- Unlock them once the transition finishes
- Respect `prefers-reduced-motion`
- For reduced motion:
  - Replace the vertical drop with a 250ms opacity transition
  - Remove bounce and overshoot

## Responsive design

- Breakpoints:
  - Mobile: below 768px
  - Tablet: 768–1024px
  - Desktop: above 1024px
- Mobile:
  - Hide desktop navigation links
  - Keep logo and CTA visible
  - CTA text may become `"Get Quote"`
  - Reduce navbar height
  - Move headline slightly lower
  - Reduce headline width and font size
  - Toggle remains near the bottom but must not overlap the description
  - Use `100svh` rather than only `100vh`
- Tablet:
  - Reduce navbar link gap
  - Keep the main desktop composition
- Desktop:
  - Full navigation visible
  - Headline and controls match the spacious reference composition

## Implementation structure

- `src/App.jsx`
- `src/components/Navbar.jsx`
- `src/components/HeroHeadline.jsx`
- `src/components/ModeToggle.jsx`
- `src/components/BackgroundTransition.jsx`
- `src/styles.css`

## Quality requirements

- Build the complete working page, not a static mockup
- Use reusable React components
- Keep state management inside the hero or App component
- Use accessible buttons and navigation
- Avoid unnecessary dependencies
- Avoid layout shifts during background transitions
- Do not generate placeholder gradients instead of the supplied images
- Do not alter the geometry of either day or night image
- The final result should feel like a premium residential solar-energy landing page with a seamless morning/night comparison interaction.
