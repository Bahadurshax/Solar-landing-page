import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { Zap } from 'lucide-react'
import MobileMenu from './MobileMenu.jsx'
import { FINE_POINTER } from '../breakpoints.js'

/* Labels are unchanged. Only About Us has a target so far, because it is the
   only section on the page carrying an id; the rest keep the placeholder
   until their sections exist. */
const LINKS = [
  { label: 'How It Works', href: '#' },
  { label: 'Our Cases', href: '#' },
  { label: 'About Us', href: '#about' },
  { label: 'Careers', href: '#' },
  { label: 'Resources', href: '#' },
  { label: 'Customers', href: '#' },
]

/* ============================================================
   The magnetic veil
   ============================================================

   One highlight for the whole bar rather than a background per link. It sits
   under whichever link the cursor is over, and moving to another link makes it
   travel: it leaves, crosses the gap, arrives slightly past the new link and
   settles back into it. Six links, one object, which is what makes the bar
   read as a single control instead of six.

   Three behaviours stacked, and they are separate on purpose:

   travel   a spring on the pill's position, underdamped enough to overshoot
            about 5% of whatever distance it just covered. That is the bounce —
            it scales with the hop, so a jump across the bar lands with more of
            one than a step to the neighbour.
   magnet   the cursor's offset from the centre of the link pulls the pill a few
            pixels off its home. The pill is chasing the link, and the cursor is
            pulling on the pill, so it never quite sits still while you move
            inside a link.
   stretch  the pill's own velocity thins it vertically and draws it out
            horizontally, so it distorts in the direction it is travelling and
            recovers as it stops. This is the part that reads as sticky. */

/* Position. ζ ≈ 0.7 — one clear overshoot and a fast settle. Below about 0.6
   the pill visibly wobbles and starts to look like a bug rather than weight. */
const TRAVEL = { stiffness: 420, damping: 27, mass: 0.9, restDelta: 0.05 }

/* Shape. Tighter and better damped than the travel: the width has to be right
   by the time the pill arrives, or the bounce reads as the pill changing size
   rather than as it landing. */
const SHAPE = { stiffness: 520, damping: 33, mass: 0.9, restDelta: 0.001 }

/* How much of the cursor's distance from the centre of a link the pill leans
   toward it, and the furthest it may lean. Seven pixels is the whole budget —
   enough that the pill is plainly aware of the cursor, small enough that it
   never stops looking like it belongs to the link it is under. */
const MAGNET = 0.16
const LEAN_MAX = 7

/* The label leans the same way, at a third of the amplitude. Both moving
   together at the same distance would just be one object sliding; the
   difference between them is what makes it read as the veil being pulled while
   the words stay put. */
const LABEL_SHARE = 0.34

/* Velocity, in px/s, at which the stretch reaches full, and what full is. A
   hop across the bar peaks near 2500, a step to the neighbour near 900, so most
   moves spend their time in the lower half of this range. */
const STRETCH_AT = 2200
const STRETCH_MAX = 0.09
const SQUASH_MAX = 0.06

const clamp = (n, min, max) => (n < min ? min : n > max ? max : n)

/* Matches App's reduced-motion hook, for the one query that decides whether
   any of this runs. On a touch screen `pointerenter` fires from a tap, so
   without this the veil would arrive under a finger, lean toward it, and stay
   there — a hover effect with no hover to end it. */
function useMatch(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(query).matches,
  )

  useLayoutEffect(() => {
    const mq = window.matchMedia(query)
    /* No synchronous read here. The lazy initialiser above already answered
       this question against the same query, so setting it again on mount only
       buys a second render pass for a value that has not moved. The subscription
       below is what this effect is for. */
    const onChange = (event) => setMatches(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}

function Navbar() {
  const navRef = useRef(null)
  const linkRefs = useRef([])
  /* Where each link sits inside the nav, measured once per layout rather than
     per pointer move: six rects a frame, to answer a question that only
     changes when the bar changes shape, is a forced layout for nothing. */
  const geometry = useRef({ navLeft: 0, boxes: [] })
  /* The highlight's current home, mirrored out of state so the pointer
     handlers below can be memoised. State still drives the render; this is
     only what those closures read. */
  const activeRef = useRef(-1)
  const [span, setSpan] = useState(0)
  const [active, setActive] = useState(-1)

  const reducedMotion = useReducedMotion()
  const finePointer = useMatch(FINE_POINTER)
  const magnetic = finePointer && !reducedMotion

  const x = useSpring(0, TRAVEL)
  /* The pill is laid out at one width and scaled to each link, because a spring
     on `width` is a layout on every frame of every hover — and the house rule
     is that a transform expresses this change instead. See DESIGN.md, Don'ts. */
  const ratio = useSpring(1, SHAPE)

  const velocity = useVelocity(x)
  /* Symmetric ranges: the distortion is about speed, not direction. */
  const stretch = useTransform(
    velocity,
    [-STRETCH_AT, 0, STRETCH_AT],
    [1 + STRETCH_MAX, 1, 1 + STRETCH_MAX],
  )
  const squash = useTransform(
    velocity,
    [-STRETCH_AT, 0, STRETCH_AT],
    [1 - SQUASH_MAX, 1, 1 - SQUASH_MAX],
  )
  const scaleX = useTransform([ratio, stretch], ([r, s]) => r * s)

  const measure = useCallback(() => {
    const nav = navRef.current
    const links = linkRefs.current.filter(Boolean)
    if (!nav || !links.length) return

    const navBox = nav.getBoundingClientRect()
    const boxes = links.map((el) => {
      const box = el.getBoundingClientRect()
      return { left: box.left - navBox.left, width: box.width }
    })

    geometry.current = { navLeft: navBox.left, boxes }

    /* The width the pill is actually laid out at, and it is the midpoint of the
       widest and narrowest link rather than either end. Everything else is
       scale, so what this number decides is how far from 1 the scale ever
       strays: from the midpoint it runs about 0.85 to 1.15, and a pill's round
       ends distort by too little at that range to be seen. Laid out at the
       widest link instead, the narrowest would sit at 0.7 and its caps would
       visibly flatten into ellipses. */
    const widths = boxes.map((box) => box.width)
    const mid = (Math.min(...widths) + Math.max(...widths)) / 2
    setSpan(mid > 0 ? Math.round(mid) : 0)
  }, [])

  useLayoutEffect(() => {
    if (!magnetic) return

    let cancelled = false
    const remeasure = () => {
      if (!cancelled) measure()
    }

    measure()
    window.addEventListener('resize', measure)

    /* Albert Sans arrives after first paint and every one of these boxes is
       text-width. Measured against the fallback face they are all wrong by a
       few pixels, which is a veil that sits slightly off the word it belongs
       to until the next resize.

       Guarded rather than relying on `measure` finding a null ref and bailing.
       That was true, but it made unmount safety a property of the callee that
       a future edit to `measure` could quietly remove. */
    document.fonts?.ready.then(remeasure)

    return () => {
      cancelled = true
      window.removeEventListener('resize', measure)
    }
  }, [magnetic, measure])

  /* Point the veil at a link. `instant` is the arrival: the first hover after
     the cursor has been away puts the pill where it belongs with no travel,
     because it is invisible at that moment and animating from wherever it was
     parked would show it sliding in from a place the visitor never saw it
     leave. Every move after that is a spring. */
  const aim = useCallback(
    (index, clientX, instant = false) => {
      const box = geometry.current.boxes[index]
      if (!box || !span) return

      let lean = 0
      if (clientX != null) {
        const centre = geometry.current.navLeft + box.left + box.width / 2
        lean = clamp((clientX - centre) * MAGNET, -LEAN_MAX, LEAN_MAX)
      }

      const nextX = box.left + lean
      const nextRatio = box.width / span

      if (instant) {
        x.jump(nextX)
        ratio.jump(nextRatio)
      } else {
        x.set(nextX)
        ratio.set(nextRatio)
      }

      /* Written straight to the element rather than held in state. This runs on
         every pointer move, and a React render per frame to move a word three
         pixels would cost more than everything else here put together. The
         smoothing is a CSS transition on the label, so the value can be written
         raw and still arrive softly. */
      const el = linkRefs.current[index]
      el?.style.setProperty('--nav-lean', `${(lean * LABEL_SHARE).toFixed(2)}px`)
    },
    [ratio, span, x],
  )

  const release = useCallback(() => {
    activeRef.current = -1
    setActive(-1)
    for (const el of linkRefs.current) el?.style.setProperty('--nav-lean', '0px')
  }, [])

  /* Memoised because `onPointerMove` is the busiest handler on the page and
     there are six of them. Defined in the render body, every one of these was a
     fresh closure on every render, so React detached and reattached all
     eighteen link handlers each time `active` changed — which it does on every
     hover. The magnet arithmetic itself was already off React's path, writing
     to motion values and custom properties rather than to state; only the
     handler identity was churning. */
  const enter = useCallback(
    (index) => (event) => {
      /* Read from the ref rather than from `active`, so these closures do not
         have to be rebuilt every time the highlight moves. "Arriving" means the
         veil is coming from nowhere rather than sliding from another link, and
         it decides between a jump and a spring — it has to be the value as of
         this event, which is exactly what the ref holds. */
      const arriving = activeRef.current === -1
      activeRef.current = index
      setActive(index)
      aim(index, event.clientX, arriving)
    },
    [aim],
  )

  const move = useCallback(
    (index) => (event) => aim(index, event.clientX),
    [aim],
  )

  /* Focus drives the same veil, without the lean — there is no cursor to lean
     toward. It is the one part of this that is not decoration: a keyboard user
     gets the same "you are here" mark a hover does, on top of the ring. */
  const focus = useCallback(
    (index) => () => {
      const arriving = activeRef.current === -1
      activeRef.current = index
      setActive(index)
      aim(index, null, arriving)
    },
    [aim],
  )

  /* onBlur, not onFocusOut on each link: tabbing from one link to the next
     would otherwise release the veil and re-arrive with a fade instead of
     travelling. This fires once, when focus actually leaves the bar. */
  const blur = useCallback(
    (event) => {
      if (!navRef.current?.contains(event.relatedTarget)) release()
    },
    [release],
  )

  return (
    <motion.header
      className="navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <a className="navbar__brand" href="#" aria-label="Solstice home">
        <Zap className="navbar__logo" size={34} strokeWidth={2.4} />
        <span className="navbar__brand-name">Solstice</span>
      </a>

      <nav
        className="navbar__nav"
        aria-label="Primary"
        ref={navRef}
        data-magnet={active >= 0 ? 'on' : undefined}
        onPointerLeave={magnetic ? release : undefined}
        onBlur={magnetic ? blur : undefined}
      >
        {/* Decoration, and it says so. The links carry the meaning; this is a
            highlight that happens to be shared, and a screen reader hearing
            about it would be hearing about the cursor. */}
        {magnetic && span > 0 && (
          <motion.span
            className="navbar__veil"
            aria-hidden="true"
            style={{ width: span, x, scaleX, scaleY: squash }}
          />
        )}

        {LINKS.map((link, index) => (
          <a
            key={link.label}
            className="navbar__link"
            href={link.href}
            ref={(el) => {
              linkRefs.current[index] = el
            }}
            onPointerEnter={magnetic ? enter(index) : undefined}
            onPointerMove={magnetic ? move(index) : undefined}
            onFocus={magnetic ? focus(index) : undefined}
          >
            {/* The label is its own element so the lean can move the words
                without moving the box they are in. Leaning the anchor itself
                would drag its hit area out from under the cursor, and the
                cursor sitting near an edge would flicker the whole effect on
                and off. */}
            <span className="navbar__link-label">{link.label}</span>
          </a>
        ))}
      </nav>

      {/* The CTA stays in the bar at every width — it is the page's primary
          action and putting it behind a tap would be a demotion. The burger
          takes the six links only, and only below the breakpoint. */}
      <div className="navbar__actions">
        {/* An anchor, not a button, and it now has somewhere to go. This was a
            handler-less <button> for the whole life of the page: the one
            control the comment above calls the primary action was the only
            control on it that did nothing at all. It resolves to the band
            after About, which is the same target the burger menu was already
            pointing at before that id existed. */}
        <a className="navbar__cta" href="#quote">
          <span className="navbar__cta-full">Schedule Installation</span>
          <span className="navbar__cta-short">Schedule</span>
        </a>

        <MobileMenu links={LINKS} />
      </div>
    </motion.header>
  )
}

export default Navbar
