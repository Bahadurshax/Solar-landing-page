/* The page's breakpoints, in one place.

   Every one of these had a twin living as a literal inside a matchMedia string
   in a component, with the matching @media rule in a stylesheet, and nothing
   holding the two together but a comment. That is a real failure mode rather
   than a tidiness complaint: MobileMenu's comment spells out exactly what
   happens when its number and the stylesheet's drift — one band of widths with
   two navigations, or one with none — and a comment cannot stop it happening.

   This fixes the JS half. CSS has no native way to share a number with a media
   query (custom properties are not allowed in @media preludes, and custom
   media queries are not implemented anywhere), so each stylesheet still holds
   its own copy. What it can do is say so: every @media that pairs with one of
   these names carries a comment pointing back here, so a reader who changes
   one has been told, at the point of the change, that there is another.

   The complement pairs are deliberate: MOBILE_NAV ends at 1024 and DESKTOP_NAV
   starts at 1025, so there is no width that satisfies both and none that
   satisfies neither. */

/* Where the inline navigation runs out of room and hands over to the burger.
   Pairs with the @media (max-width: 1024px) block in styles.css. */
export const DESKTOP_NAV = '(min-width: 1025px)'

/* Where a pointer is precise enough to be worth tracking, and where the
   viewport is wide enough for parallax to have room to move. The width is the
   same number as the nav swap by coincidence of layout, not by dependency, so
   it is named separately — the two are free to move apart. */
export const FINE_POINTER = '(pointer: fine)'
export const WIDE_VIEWPORT = '(min-width: 1025px)'

export const NO_MOTION = '(prefers-reduced-motion: reduce)'
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

/* Where How It Works gives up the pinned stack and lays the cards out in flow.
   Pairs with the @media (max-width: 768px) block in how-it-works.css. */
export const PINNED_STAGE = `(min-width: 769px) and ${MOTION_OK}`

/* Where the About track stops being a horizontal pan. Pairs with the
   @media (max-width: 900px) block in about.css.

   It used to name the testimonial wall's breakpoint too. It no longer does:
   the wall is a marquee, so it is gated on MARQUEE_OK below like the partners
   band rather than on width and motion alone. The number is the same one. */
export const WIDE_STAGE = `(min-width: 901px) and ${MOTION_OK}`
export const NARROW_STAGE = `(max-width: 900px), ${NO_MOTION}`

/* Where a band is allowed to move on its own — the partners strip and the
   testimonial wall both.

   Three conditions and not one of them is about width alone. The band is a
   marquee, and a marquee's whole defence is that the reader can stop it: it
   brakes to a halt under the cursor. That defence does not exist without a
   cursor, so a coarse pointer gets the static list rather than a band it can
   only watch go past. The width is the wall's own number rather than a fourth
   breakpoint, and the motion preference is the usual veto.

   Pairs with the @media blocks in partners.css and testimonials.css, both of
   which mirror all three. Those stylesheets state the *complement* — a band
   only moves where every condition holds, so the static fallback is the
   comma-joined negation:

       @media (max-width: 900px), (pointer: coarse),
              (prefers-reduced-motion: reduce)

   Change the width here and there are now two of those to change. */
export const MARQUEE_OK = `(min-width: 901px) and ${FINE_POINTER} and ${MOTION_OK}`
