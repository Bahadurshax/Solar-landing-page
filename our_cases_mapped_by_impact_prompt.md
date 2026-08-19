
# “Our Cases” Section Prompt

Create a premium **“Our Cases”** section for a residential solar-energy landing page using **React, Vite, and Framer Motion (`motion` package)**. Use **plain CSS only**—no Tailwind. The section should recreate a clean editorial world-map case-study design with a large heading on the left, region filters on the top right, a dotted world map as the main visual, a floating featured case card in the center, a horizontal case carousel at the bottom, and a compact stats bar below.

## Stack

- React 19
- Vite
- `motion` from `motion/react`
- `lucide-react`
- Plain CSS

## Design direction

- Premium, minimal, editorial
- Soft warm off-white background
- Clean black typography
- Light beige/gold accent color
- Rounded cards with very subtle borders and shadows
- Elegant, spacious layout
- Data-rich but uncluttered
- World map should feel light and atmospheric, not bold or heavy
- The whole section should feel like an award-level clean SaaS/product showcase, not a generic dashboard

## Section layout

Create a full-width section with generous spacing.

```css
padding: 72px 56px 40px;
background: #f8f6f1;
color: #121212;
overflow: hidden;
```

Use a large desktop layout with these zones:

1. Top-left editorial block
2. Top-right region filter pills
3. Large dotted world map background
4. Centered featured case card floating above the map
5. Bottom horizontal carousel of case thumbnails
6. Bottom stats bar

Use a wide container, around `max-width: 1500px`, centered.

## Typography

Use **Satoshi**, **Geist**, or **Cabinet Grotesk**. Do **not** use Inter.

### Label

Small label above the heading:

```text
OUR CASES
```

Style:

- Font-size: `12px`
- Letter-spacing: `0.16em`
- Uppercase
- Font-weight: 500
- Color: `#b08a53`

### Main heading

Use exactly:

```text
Case studies,
mapped by impact.
```

Style:

- Font-size: `clamp(3.3rem, 5vw, 5.4rem)`
- Line-height: `0.94`
- Letter-spacing: `-0.06em`
- Font-weight: `500`
- Max width: `520px`

### Supporting paragraph

Use:

```text
Real homes. Real results. Explore how families around the world are saving with clean, independent energy.
```

Style:

- Font-size: `15px`
- Line-height: `1.55`
- Color: `rgba(18,18,18,0.72)`
- Max width: `520px`
- Margin-top: `22px`

## Top row layout

Use a flex row between the left editorial block and the top-right filter bar.

### Left block

Contains:

- Small label
- Heading
- Supporting paragraph

### Right block

Contains four pill-shaped region filter buttons:

- `All`
- `Europe`
- `North America`
- `Asia-Pacific`

Style for pills:

- Height: `44px`
- Horizontal padding: `24px`
- Border-radius: `999px`
- Border: `1px solid rgba(176,138,83,0.24)`
- Background: `#fbfaf7`
- Font-size: `14px`
- Font-weight: `500`
- Text color: `#222`

Active pill (`All` by default):

- Background: `#fffaf0`
- Border color: `rgba(176,138,83,0.45)`
- Soft warm shadow
- Slightly darker text

Hover interaction:

- Lift by `-2px`
- Border becomes slightly more visible
- Transition: `0.25s ease`

## World map area

Below the top row, create a large main visualization zone.

### Map styling

- Use a very light dotted world map
- Color: `rgba(176, 156, 120, 0.22)`
- The map spans most of the section width
- It sits behind the featured case card
- The map should be centered horizontally
- Large enough to dominate the section visually without overpowering text

Recommended implementation:

- SVG or background image of a dot-based world map
- Soft beige tone
- No hard outlines
- Slight fade at the edges is acceptable

## Map pins and routes

Show subtle highlighted map nodes and connection lines.

### Pins

Display four to five circular points on the map:

- North America
- Germany / Europe
- East Asia
- Australia
- Optional secondary node in South America or Africa

Pin style:

- Small gold/orange dot at center
- Soft concentric ring glow
- Outer circle subtle and semi-transparent

Active pin for Germany:

- Larger glow
- Two or three concentric circles
- Warm gold/orange tone

### Routes

Draw thin curved connection lines between the active Germany pin and the other highlighted points.

Route styling:

- Thin line
- Color: `rgba(213, 177, 106, 0.45)`
- Smooth curve
- Very light and elegant
- Do not clutter the map

## Featured case card

Place a large floating featured card near the center of the map.

### Card structure

Rounded rectangle with:

- Soft off-white surface
- Border: `1px solid rgba(0,0,0,0.05)`
- Subtle shadow
- Border-radius: `22px`
- Width: around `640px`
- Padding: `22px 22px 18px`

Split the card into two columns.

### Left column

Contains:

1. Country row with small flag
2. Region below it
3. Family name
4. Two stat blocks
5. Quote
6. Signature line
7. Bottom guarantee badge

### Right column

Contains:

- Featured house image
- Rounded corners
- Medium-large rectangular aspect ratio

## Featured case content

Use this exact content.

### Country block

- Flag: Germany
- Country: `Germany`
- Region: `Bavaria`

### Family name

```text
The Schneider Family
```

Style:

- Font-size: `18px`
- Font-weight: `600`
- Margin-top: `10px`
- Margin-bottom: `16px`

### Two stat blocks

Display two side-by-side mini stats:

1. `System Size`
   - Value: `10.2 kW`

2. `Est. Savings / 7 yrs`
   - Value: `$18,420`

Style:

- Small muted labels
- Strong numeric values
- Divider between them

### Quote

```text
“Going solar gave us more than savings—it gave us peace of mind.”
```

Style:

- Font-size: `14px`
- Line-height: `1.5`
- Color: `rgba(18,18,18,0.72)`
- Margin-top: `14px`

### Attribution

```text
— The Schneider Family
```

Style:

- Font-size: `14px`
- Color: `rgba(18,18,18,0.78)`

### Bottom badge

Create a guarantee strip inside the card footer.

Left side:

```text
$0 bills for 7 years
```

Right side:

```text
Guaranteed
```

Style:

- Height: `42px`
- Border-radius: `14px`
- Border: `1px solid rgba(213,177,106,0.35)`
- Light warm background
- Small shield/check icon on the left
- Horizontal alignment

### Featured image

Use a premium house image with solar panels.

Image style:

- Width: about `230px`
- Height: about `170px`
- Border-radius: `16px`
- `object-fit: cover`
- Clean modern home
- Warm daylight or soft evening light
- Solar panels clearly visible

## Bottom case carousel

Below the map and featured card, create a horizontal strip of case cards.

### Layout

- Place the carousel near the bottom of the section
- Center it horizontally
- Include left and right circular arrow buttons outside the strip
- Show around five visible cards
- Highlight one active card

### Case items

Each item contains:

- Small house thumbnail on the left
- Country and region or city above
- Family name
- Small metrics row
- Savings text

Use these cases:

1. `California, USA`
   - `Johnson Family`
   - `9.6 kW`
   - `$16,980`
   - `Saved over 7 years`

2. `Queensland, Australia`
   - `Williams Family`
   - `8.4 kW`
   - `$14,210`

3. `Bavaria, Germany`
   - `Schneider Family`
   - `10.2 kW`
   - `$18,420`

4. `Amsterdam, Netherlands`
   - `De Vries Family`
   - `9.1 kW`
   - `$15,230`

5. `Tokyo, Japan`
   - `Sato Family`
   - `7.8 kW`
   - `$13,490`

### Card style

- Width: `250–290px`
- Height: around `140px`
- Background: `#fffdf9`
- Border-radius: `18px`
- Border: `1px solid rgba(0,0,0,0.05)`
- Padding: `14px`
- Display: grid or flex
- Thumbnail width: around `96px`
- Thumbnail height: around `96px`
- Soft shadow only on hover or active

### Active case card

The Germany / Schneider Family card is active.

Active styling:

- Gold/beige border
- Slightly more visible shadow
- Warm surface tint
- Slightly lifted using `translateY(-3px)`

### Carousel arrows

- Circular buttons
- Diameter: `54px`
- Background: `#fffdf9`
- Border: `1px solid rgba(0,0,0,0.08)`
- Use `ChevronLeft` and `ChevronRight`
- Strong visible contrast

On hover:

- Move up `-2px`
- Shadow appears
- Arrow nudges in the direction of motion

## Stats bar

Below the carousel, create a long centered rounded stats panel.

### Stats content

Display four compact stats:

1. `5,200+`
   - `Homes powered`

2. `18.7M+`
   - `kg CO₂ avoided`

3. `7`
   - `Years guaranteed`

4. `24/7`
   - `Smart monitoring`

### Style

- Height: around `84px`
- Background: `#fbfaf7`
- Border-radius: `22px`
- Border: `1px solid rgba(0,0,0,0.05)`
- Width: about `1100px`
- Max-width: `100%`
- Display: grid with four equal columns
- Vertical separators between items
- Small line icons above or beside each value
- Icon color: muted dark gray
- Value font-weight: `600`
- Label font-size: `13px`
- Label color: `rgba(18,18,18,0.62)`

## Motion and interaction

Use `motion` for all transitions and interactive states.

### Section entrance

When the section enters the viewport:

- Heading block rises from `y: 30`, opacity `0`
- Filter pills fade in with stagger
- Map fades in and scales from `0.98` to `1`
- Featured card rises slightly and fades in
- Carousel slides up from `y: 24`
- Stats bar fades in last

Recommended easing:

```js
ease: [0.16, 1, 0.3, 1]
```

### Map pin interactions

On hover over a pin:

- Glow intensifies
- Rings expand gently
- Connection line to featured card becomes more visible
- A small tooltip may appear

### Featured card hover

- Shadow deepens slightly
- Card lifts by `-2px`
- Image scales to `1.02`

### Carousel interactions

Hovering a case card slightly raises it.

Clicking a case card updates:

- Featured card content
- Active map pin
- Active highlight in the carousel
- Connection routes, where applicable

Animate changes using smooth fades and slides, not abrupt replacement.

### Filter interactions

Clicking a region filter updates the visible cases and highlighted pins.

Animation:

- Pins fade and scale in or out
- Featured card crossfades its content
- Carousel items shift using a smooth layout transition

### Carousel arrows

Clicking left or right moves the carousel by one item using a smooth horizontal slide.

## Responsive behavior

### Desktop

- Full composition as described
- World map, floating card, carousel, and stats visible together

### Tablet

- Keep the map large
- Slightly reduce heading size
- Reduce carousel card widths
- Make the featured card slightly narrower
- Allow filters to wrap where needed

### Mobile

Reflow into this vertical order:

1. Label
2. Heading
3. Supporting text
4. Horizontally scrollable filter pills
5. Map
6. Featured card below the map
7. Horizontal swipe carousel
8. Stats grid in a two-by-two layout

Mobile details:

- Reduce heading size
- Stack the featured card vertically
- Place the image above the text content
- Make the carousel swipeable
- Convert the stats bar into a two-column grid

## Accessibility

- Use semantic sectioning
- Provide alt text for every thumbnail and featured image
- All buttons require visible focus states
- Filter pills must be keyboard accessible
- Carousel arrows require accessible labels
- Do not rely only on color for the active case state

## Suggested component structure

```text
src/
  App.jsx
  components/
    OurCasesSection.jsx
    RegionFilters.jsx
    WorldMap.jsx
    FeaturedCaseCard.jsx
    CasesCarousel.jsx
    StatsBar.jsx
  styles/
    our-cases.css
```

## Quality requirements

- Recreate the overall composition and mood of the selected design
- Keep the interface clean and premium
- Maintain wide editorial typography
- Preserve strong spacing and visual hierarchy
- Avoid cheap labels, clutter, and dashboard-like density
- Keep the world map subtle and elegant
- Ensure the featured case card remains the visual focal point
- Use smooth, high-end interaction polish
- The result should resemble a premium solar-energy case-study showcase suitable for an award-level landing page
