import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'
import { NO_MOTION } from './breakpoints.js'

/* Momentum scrolling for the whole page.
 *
 * The wheel no longer moves the document — it moves a target, and the document
 * eases toward it every frame. Letting go of a gesture therefore coasts to a
 * stop over a short distance instead of ending on the last notch of the wheel,
 * which is the whole point of it.
 *
 * There is one instance for the page and it lives here rather than in a
 * component, because three other things need to talk to it: the pinned card
 * sequence has to hold it still while it snaps, the mobile menu has to hold it
 * still while it is open, and the footer's back-to-top has to route through it
 * rather than around it. A module-level handle is the honest way to say that
 * this is one piece of page-wide state.
 */

let lenis = null

export const getLenis = () => lenis

/* How hard the page chases the wheel, and the only number here worth playing
   with. Lenis defaults to 0.1; this is slower, so the tail after a gesture is
   longer and the stop is softer. Below about 0.06 the page starts to feel like
   it is sliding on ice and the lag between the wheel and the pixels becomes
   something you notice rather than something you feel. */
const LERP = 0.085

/* The mark a scroll started here carries while it is running.

   Lenis holds `userData` for the length of one scroll animation and replaces it
   at the start of the next one — including the one a wheel notch starts, which
   passes none and therefore clears it. So the question "is the page moving
   itself right now, or is somebody moving it" has an answer for free, and it
   goes stale on its own the moment the visitor touches the wheel.

   It exists for the section seam. That file takes the scroll over inside one
   viewport of the page, and it could not tell a gesture into that viewport from
   a journey through it — so the footer's back-to-top, and every navigation link
   that points above the seam, was caught on the way past and set down on the
   quote band instead of arriving where it was sent. A scroll this page started
   is not a gesture, and this is how the seam knows. */
const PAGE_MOVE = { page: true }

/** Whether a scroll this page started is still running. */
export const isPageMoving = () => Boolean(lenis?.userData?.page)

/**
 * Starts smooth scrolling and returns a teardown.
 *
 * Does nothing at all under reduced motion — for someone who has asked the
 * system to stop animating things, a page that keeps moving after the gesture
 * has ended is the exact complaint, and native scrolling is the correct
 * behaviour rather than a degraded one.
 */
export function startSmoothScroll() {
  if (lenis) return () => {}
  if (typeof window === 'undefined') return () => {}
  if (window.matchMedia(NO_MOTION).matches) return () => {}

  lenis = new Lenis({
    lerp: LERP,
    /* Wheel and trackpad only. Touch devices already have momentum in the
       compositor, and it is better than anything reproducible in JavaScript —
       taking it over costs the handoff to the browser's own overscroll and
       address-bar behaviour and gives nothing back. */
    smoothWheel: true,
    syncTouch: false,
    /* Lenis takes the in-page links, so `#quote` in the navigation and the
       mobile menu arrives on the same easing as everything else instead of
       teleporting. An object rather than `true` only so those scrolls carry the
       mark above: Lenis handles an anchor click itself, without passing through
       `scrollTo` below, so this is the one place they can be told apart from a
       gesture. */
    anchors: { userData: PAGE_MOVE },
    /* The GSAP ticker drives the loop below. Left on, Lenis would run a second
       requestAnimationFrame of its own and the page would advance twice per
       frame. It defaults to false in this version; it is spelled out because
       the two lines are only correct together. */
    autoRaf: false,
  })

  /* ScrollTrigger has to be told on Lenis's terms. Every pin, scrub and snap on
     the page reads `window.scrollY` when a scroll event fires — but Lenis moves
     the document from inside an animation frame, so those events arrive after
     ScrollTrigger has already decided nothing changed. Feeding it Lenis's own
     scroll event puts the two back in step. */
  lenis.on('scroll', ScrollTrigger.update)

  const raf = (time) => lenis?.raf(time * 1000)
  gsap.ticker.add(raf)

  /* GSAP's lag smoothing exists to stop a long frame — a tab regaining focus,
     a heavy paint — from being played back as one enormous jump. That is the
     right call for a tween of an element, and the wrong one for a scroll
     position, where it desynchronises the page from where the document
     actually is and the two spend the next few frames arguing. */
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(raf)
    gsap.ticker.lagSmoothing(500, 33)
    lenis?.destroy()
    lenis = null
  }
}

/* Hold the page still, and let it go again. Used by anything that takes the
   scroll over for a moment: the card sequence's snap, and the mobile menu,
   which puts `overflow: hidden` on the body — a rule Lenis does not read,
   because it sets the scroll position itself rather than asking for it. */
export const pauseSmoothScroll = () => lenis?.stop()
export const resumeSmoothScroll = () => lenis?.start()

/**
 * Scrolls to a position or an element, on the page's easing where there is
 * one and natively where there is not.
 *
 * Everything that moves the page on purpose should come through here. A raw
 * `window.scrollTo` still works, but Lenis will overwrite it on the very next
 * frame with wherever it thought the page was going, so the jump either fights
 * the easing or is undone by it.
 *
 * Marked as the page's own move by default. Anything that is moving the page
 * *as* the scroll rather than in spite of it — the seam, which is answering a
 * gesture rather than replacing it — passes its own `userData` and opts out.
 */
export function scrollTo(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, { userData: PAGE_MOVE, ...options })
    return
  }

  const top =
    typeof target === 'number'
      ? target
      : (target?.getBoundingClientRect?.().top ?? 0) + window.scrollY

  window.scrollTo({
    top,
    behavior: window.matchMedia(NO_MOTION).matches ? 'auto' : 'smooth',
  })
}
