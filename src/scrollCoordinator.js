import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from './smoothScroll.js'

/* ============================================================
   One listener, one read, one frame
   ============================================================

   Three separate things on this page follow the scroll: the hero's depth
   parallax, the film's open/close seam, and the quote → testimonials seam.
   Each of them used to attach its own `window` scroll listener, and each of
   them opened by measuring — a `getBoundingClientRect()` on the element it
   cares about, before it had decided whether it had anything to do.

   Instrumented, that came to 4.6 rect reads per scroll event. Reading layout
   inside a scroll handler forces the browser to flush style and layout
   synchronously, so those were 4.6 forced reflows per event on a page already
   carrying twenty-odd ScrollTriggers and several full-viewport composited
   layers.

   Two changes, and they are separate ideas that happen to belong in one file.

   ------------------------------------------------------------
   One listener, coalesced to the frame

   `onScroll` subscribers share a single passive listener. It does not call
   them; it marks the page dirty and asks for a frame. Everything is notified
   once per frame with the same `y`, the same `delta` and the same velocity
   reading, which is both cheaper and more consistent than three handlers each
   sampling at whatever moment its own event happened to arrive.

   Per-frame delta is also the better signal for what the seams do with it.
   Scroll events are not evenly spaced — a trackpad can deliver several in one
   frame and none in the next — so a per-event delta is a distance over an
   unknown interval. A per-frame one is not.

   ------------------------------------------------------------
   Measure on layout change, not on scroll

   The old comments were right that these offsets have to be re-measured rather
   than assumed: the quote band is pulled up over a pinned section by a margin
   that section publishes at runtime, so a number read once at startup is wrong
   by the first resize. What was wrong was the *moment*. Those offsets are
   positions in the document, and scrolling does not change a position in the
   document — it changes which part of the document you are looking at. A
   pinned section does not move its neighbours either: ScrollTrigger reserves
   the space with a pin-spacer, so document offsets hold still while the pin
   scrubs.

   So `onMeasure` callbacks run when the layout actually changes — on resize,
   after fonts settle, and after every `ScrollTrigger.refresh()`, which is the
   moment pins and spacers are rebuilt — and never on scroll. Subscribers cache
   what they need and spend it for free on every frame after that.

   `invalidate()` is there for the cases the three signals above do not cover:
   a section that changes its own height, an image that arrives late. */

const scrollSubs = new Set()
const measureSubs = new Set()

let listening = false
let frame = 0
let measureFrame = 0
let previous = 0

/* Notify once per frame with one reading, rather than once per event with one
   reading each. `previous` is carried across frames, so `delta` is the distance
   travelled since subscribers last saw the page — not since the last event. */
const flush = () => {
  frame = 0
  const y = window.scrollY
  const delta = y - previous
  previous = y

  /* Read once and hand it to everyone. Both seams ask Lenis the same question
     on the same frame, and it is the same answer. */
  const velocity = getLenis()?.velocity ?? 0

  for (const fn of scrollSubs) fn(y, delta, velocity)
}

const onNativeScroll = () => {
  if (!frame) frame = requestAnimationFrame(flush)
}

/* Coalesced too. A resize fires in a stream, and `ScrollTrigger.refresh()` can
   arrive alongside one — measuring on each would be the problem this file
   exists to remove, moved somewhere quieter. */
const runMeasures = () => {
  measureFrame = 0
  for (const fn of measureSubs) fn()
}

export const invalidate = () => {
  if (!measureFrame) measureFrame = requestAnimationFrame(runMeasures)
}

const listen = () => {
  if (listening) return
  listening = true
  previous = window.scrollY
  window.addEventListener('scroll', onNativeScroll, { passive: true })
  window.addEventListener('resize', invalidate)
  /* The one that matters most. A refresh is where pins are torn down and
     rebuilt and where every spacer is re-sized, so it is the moment every
     cached document offset on the page becomes a guess. */
  ScrollTrigger.addEventListener('refresh', invalidate)
}

const stop = () => {
  if (!listening) return
  listening = false
  window.removeEventListener('scroll', onNativeScroll)
  window.removeEventListener('resize', invalidate)
  ScrollTrigger.removeEventListener('refresh', invalidate)
  cancelAnimationFrame(frame)
  cancelAnimationFrame(measureFrame)
  frame = 0
  measureFrame = 0
}

const release = () => {
  if (!scrollSubs.size && !measureSubs.size) stop()
}

/**
 * Follow the scroll. `fn(y, delta, velocity)` runs at most once per frame.
 * Returns an unsubscribe.
 */
export function onScroll(fn) {
  scrollSubs.add(fn)
  listen()
  return () => {
    scrollSubs.delete(fn)
    release()
  }
}

/**
 * Re-read layout. `fn()` runs immediately, then on every layout change.
 * Returns an unsubscribe.
 *
 * Callers are expected to cache inside `fn` and read the cache on scroll — that
 * is the whole point of the split.
 */
export function onMeasure(fn) {
  measureSubs.add(fn)
  listen()
  fn()
  return () => {
    measureSubs.delete(fn)
    release()
  }
}

/** Where an element sits in the document, rather than in the viewport. */
export const documentTop = (el) =>
  el.getBoundingClientRect().top + window.scrollY
