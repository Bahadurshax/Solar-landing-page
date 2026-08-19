import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FINE_POINTER, NO_MOTION, WIDE_VIEWPORT } from '../breakpoints.js'
import { onMeasure, onScroll } from '../scrollCoordinator.js'

/* Served from public/ by literal path rather than imported through the bundler,
   and the reason is the preload in index.html. Both frames are also the case
   photographs behind Our Cases and the plate behind the footer, which reach
   them by the same literal paths; importing them here as well would hash them
   into a second URL and buy the visitor a second 2MB download of a picture
   they already have. One path, one fetch, one cache entry.

   The cost of leaving the bundler out of it is the content hash, so these two
   cannot be cache-busted by a rebuild the way a hashed asset can. They are
   photographs of a house; if either is ever re-shot, rename the file.

   The `-blur` suffix on the back plates is not decoration. Those two carry the
   far plane's defocus baked in rather than getting it from a CSS filter — the
   reasoning is on `.background-plate--back` in the stylesheet, and the sharp
   originals are still beside them if it ever needs regenerating. */
const FRAMES = {
  morning: {
    back: '/images/solar-house-day-back-blur.jpeg',
    front: '/images/solar-house-day-no-bg.png',
  },
  night: {
    back: '/images/solar-house-night-back-blur.jpeg',
    front: '/images/solar-house-night-no-bg.png',
  },
}

/* Which plate belongs on which side of the headline.

   The hero is not the flat photograph split in two: the house is its own
   render on transparency and the back plate is a matching empty lot, so the
   composition is assembled in the browser rather than cropped out of one
   picture. The two share no pixels, which is why they can be pulled as far
   apart as the composition allows without anything doubling. How they are
   placed against each other is all in the stylesheet — the plates are
   deliberately not the same size or the same shape.

   Split by side rather than by painting order, because that is a real division
   here: the house stands in front of the type and the lot stands behind it, so
   the headline is *inside* the photograph rather than laid on top of one. Two
   layers, because a stacking context cannot be entered halfway — anything that
   would put the house above the headline while it sits in the same element as
   the lot has to lift the lot with it.

   There used to be three of these, chosen at runtime by a development-only
   switcher: this one, and two single-plane behaviours running on the flat
   original that were being tried against it. The comparison is over and the
   other two are gone, along with the switcher, its stored preference, and the
   two `[data-depth]` branches they needed in styles.css. */
const BEHIND = ['back']
const IN_FRONT = ['front']

/* How fast the rendered position chases the target, per frame. Low enough that
   a flicked cursor arrives with some weight behind it, high enough that the
   scroll lag never feels rubbery — the plates are meant to sit at a different
   depth, not to trail the page on a spring. */
const LERP = 0.12

/* Below this the remaining distance is under a tenth of a pixel at every
   amplitude in the stylesheet, so the loop stops rather than spending frames
   on motion nobody can see. */
const SETTLED = 0.0005

const clamp = (n) => (n < -1 ? -1 : n > 1 ? 1 : n)

/**
 * Drives the hero's depth parallax.
 *
 * Writes three unitless numbers — pointer x, pointer y, and how far the hero
 * has scrolled away — to custom properties on the hero section. The distances
 * those numbers turn into live in the stylesheet, one amplitude per thing that
 * moves, so what is near and what is far is tuned where the rest of the hero's
 * proportions are and this file never has to know how many pixels anything
 * travels.
 *
 * They go on the section for three reasons, and each one on its own would be
 * enough. Its box is the hero's box, so one measurement answers both the cursor
 * and the scroll. Everything that moves is inside it — the two background
 * layers and the headline that passes between them — and they have to agree,
 * because the whole effect is the relationship between them rather than any one
 * of their motions. And the layers themselves are keyed by mode and thrown away
 * by AnimatePresence on every toggle: a value written onto one would be lost the
 * moment someone switched to night, and the incoming layer would arrive at rest
 * while the outgoing one was still drifting.
 *
 * It also keeps this off motion's toes. The layer element owns `y` for the swap
 * animation and the headline owns `transform` for its entrance; nothing here
 * writes either. Custom properties are read by the stylesheet, and the headline
 * spends them through `translate`, which composes with a transform rather than
 * replacing it.
 */
function useHeroParallax(ref, reducedMotion) {
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion || window.matchMedia(NO_MOTION).matches) return

    /* Scroll depth runs everywhere; cursor depth needs a pointer worth
       tracking and a viewport with room to move it in. */
    const tracksPointer =
      window.matchMedia(FINE_POINTER).matches &&
      window.matchMedia(WIDE_VIEWPORT).matches

    const target = { x: 0, y: 0, scroll: 0 }
    const current = { x: 0, y: 0, scroll: 0 }
    const keys = ['x', 'y', 'scroll']
    let frame = 0

    const render = () => {
      frame = 0
      let moving = false

      for (const key of keys) {
        const delta = target[key] - current[key]
        if (Math.abs(delta) < SETTLED) {
          current[key] = target[key]
        } else {
          current[key] += delta * LERP
          moving = true
        }
      }

      el.style.setProperty('--hp-x', current.x.toFixed(4))
      el.style.setProperty('--hp-y', current.y.toFixed(4))
      el.style.setProperty('--hp-scroll', current.scroll.toFixed(4))

      if (moving) frame = requestAnimationFrame(render)
    }

    /* One loop, started on demand and allowed to die once everything has
       arrived. A permanently running rAF would hold the main thread awake for
       the whole session to write three numbers that had stopped changing. */
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }

    /* The hero's box in *document* coordinates, re-read only when the layout
       changes. Scrolling does not move the hero down the document; it moves the
       viewport down over it. So the one number that varies per frame is
       `window.scrollY`, and everything else here is a constant between
       reflows — which is what lets both handlers below run without touching
       layout at all. See scrollCoordinator.js. */
    const box = { top: 0, left: 0, width: 0, height: 0 }

    const stopMeasuring = onMeasure(() => {
      const rect = el.getBoundingClientRect()
      box.top = rect.top + window.scrollY
      box.left = rect.left + window.scrollX
      box.width = rect.width
      box.height = rect.height
    })

    /* How far the hero has scrolled away, from the cache. Identical arithmetic
       to the old `-rect.top / rect.height`, since `rect.top` is by definition
       the document offset minus the current scroll. */
    const readScroll = (y) => {
      target.scroll = box.height
        ? Math.min(Math.max((y - box.top) / box.height, 0), 1)
        : 0
    }

    const stopScrolling = onScroll((y) => {
      readScroll(y)
      wake()
    })

    /* Bound to the window rather than to the hero: the wrapper is
       `pointer-events: none` and sits behind the navigation, the headline and
       the toggle, so a listener on it would go quiet exactly where the cursor
       spends its time. Clamped because the same listener keeps firing while
       the cursor is three sections further down the page. */
    /* Also off layout, and this is the half that was costing the most: a
       pointer moving across the hero delivers events far faster than the scroll
       does, and each one used to force a reflow. The hero's viewport-relative
       edges are its document edges minus the current scroll. */
    const onPointerMove = (event) => {
      if (!box.width || !box.height) return
      const left = box.left - window.scrollX
      const top = box.top - window.scrollY
      target.x = clamp(((event.clientX - left) / box.width - 0.5) * 2)
      target.y = clamp(((event.clientY - top) / box.height - 0.5) * 2)
      wake()
    }

    const onPointerLeave = () => {
      target.x = 0
      target.y = 0
      wake()
    }

    readScroll(window.scrollY)
    wake()

    if (tracksPointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerleave', onPointerLeave)
    }

    return () => {
      cancelAnimationFrame(frame)
      stopScrolling()
      stopMeasuring()
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)

      /* Cleared rather than left where they were. This effect also tears down
         when the visitor turns reduced motion on mid-session, and the last
         values written would otherwise stay on the element as a permanent
         offset — motion switched off, but frozen mid-drift. */
      el.style.removeProperty('--hp-x')
      el.style.removeProperty('--hp-y')
      el.style.removeProperty('--hp-scroll')
    }
  }, [ref, reducedMotion])
}

/**
 * Full-screen background that swaps between the day and night house.
 *
 * Both planes rise. The lot fades up over the outgoing one, which holds its
 * light underneath until the new plate is solid; the house in front of the
 * headline floats up from below the fold, further and slower, after the old one
 * has cleared out. Same direction, two distances — the near plane travels, the
 * far plane barely does, which is what keeps them reading as one scene shifting
 * from morning to night rather than as two pictures being changed.
 *
 * Each layer is three stacked copies of its photograph rather than one, which
 * is what gives the still frame its depth — see the plate rules in styles.css.
 */
function BackgroundTransition({
  mode,
  hostRef,
  reducedMotion,
  onTransitionComplete,
}) {
  /* The hero section itself, handed down from App. The parallax is measured
     against it and written onto it, because the headline rides the same two
     numbers and the section is the only element both are inside. */
  useHeroParallax(hostRef, reducedMotion)

  /* The frame the visitor is not looking at, warmed once the page is idle.
     Only one mode is ever in the DOM, so without this the first toggle starts
     a cold two-megabyte fetch and the rise animates an empty layer — App
     budgets 1200ms for that animation, which is nothing like enough time to
     download the picture on a slow connection. Deferred to an
     idle callback so it never competes with the frame that is on screen. */
  useEffect(() => {
    const warm = () => {
      for (const frame of Object.values(FRAMES)) {
        for (const src of Object.values(frame)) {
          const img = new Image()
          img.src = src
        }
      }
    }

    const idle = window.requestIdleCallback
    if (!idle) {
      const t = setTimeout(warm, 2000)
      return () => clearTimeout(t)
    }

    const handle = idle(warm, { timeout: 4000 })
    return () => window.cancelIdleCallback(handle)
  }, [])

  /* The lot rises, and it fades up as it comes.

     It used to fall: a whole frame of wallpaper arriving from above the
     viewport on a stiff spring, on the argument that the weight of it was what
     gave the toggle its punch. What it actually did was contradict the thing in
     front of it. The house floats up out of the bottom of the frame, so the two
     halves of one scene were travelling in opposite directions across the
     headline between them, and a toggle that is meant to read as an hour
     changing read as two pictures being swapped by different machinery.

     Both planes now come from below. The lot is the far one, so it travels a
     fraction of the distance the house does — 10% of the frame against 38% —
     which is the same near/far ratio the pointer and scroll amplitudes in the
     stylesheet already use. Shallow travel and a long ease-out is what depth
     looks like; matching the house's distance would have flattened the two
     planes into one.

     The fade finishes early against the travel, on purpose, and for the same
     reason the house's does. This plate and its opposite number are the same
     lot at two hours, so while the incoming one is both offset and translucent
     its treeline sits above the outgoing one's as a soft doubled horizon. The
     opacity ramp is over in a third of a second, by which point the ease-out
     has already closed most of the offset — the window where a pair is legible
     is early, brief, and at the low end of the fade where there is least to
     see. After that it is one solid plate gliding the last few pixels home. */
  const lot = reducedMotion
    ? {
        initial: { y: '0%', opacity: 0 },
        animate: { y: '0%', opacity: 1 },
        exit: { y: '0%', opacity: 0 },
        transition: { opacity: { duration: 0.25 }, y: { duration: 0 } },
      }
    : {
        initial: { y: '10%', opacity: 0 },
        animate: {
          y: '0%',
          opacity: 1,
          transition: {
            y: { duration: 0.78, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.32, ease: [0.33, 0, 0.67, 1] },
          },
        },
        /* Holds its light and settles a couple of percent. It keeps full
           opacity because it is the only thing under the incoming plate while
           that plate is still transparent — fading it out would open a hole
           onto the hero's own ground for the length of the crossfade. The 2%
           is not really a move: it is a duration, giving the layer a real
           animation so AnimatePresence keeps it mounted until the plate above
           it is solid. */
        exit: {
          y: '2%',
          transition: { y: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
        },
        transition: {},
      }

  /* The house does not fall with it. It floats up from below the fold — the old
     frame clears out first, then the new one rises into place and fades in as it
     comes.

     It has to be its own move rather than the lot's. The house is a cutout of a
     single object standing in the frame, and an object that drops in from the
     sky has plainly arrived from somewhere. Rising out of the bottom of the
     frame reads as the house settling onto its own lot instead.

     The two are sequenced rather than crossfaded, and that sequencing is the
     whole reason this works. The day and night houses are cutouts on
     transparency and they are not the same shape — 2138x736 against 2011x782 —
     so any window where both are part-way visible shows one house's roofline and
     eaves standing out around the other's. It does not read as a dissolve; it
     reads as a double exposure of the thing the composition is built around. So
     the outgoing house is given a short, complete exit and the incoming one is
     held back until that exit is essentially finished. The two opacity ramps
     overlap by well under a tenth of a second, which is short enough that no
     frame carries a legible pair of houses.

     That leaves a moment with no house over the headline. It is brief and it is
     the right trade: an uncovered headline for a few frames looks like nothing
     at all, where a doubled roofline looks like a bug.

     It is also what makes the move affordable. These are full-viewport plates
     carrying a two-megabyte photograph with an alpha channel, and a layer at
     partial opacity has to be composited into its own texture and blended before
     it can be painted. Two of those at once, over two blurred plates on the
     other side of the headline, is four full-screen surfaces for the compositor
     to reconcile every frame. Sequencing the fades keeps it to one. The long
     part of the move is the rise, and a transform is the cheap half — it moves
     an existing texture rather than re-blending it, so the float can be slow
     without costing anything.

     The fade finishes well before the travel does, on purpose: the house is
     fully solid for most of its climb, so the eye reads a house floating up
     rather than one materialising in mid-air.

     The whole thing lands inside App's 1200ms fallback, which matters because
     the toggle's latch is cleared by the lot's spring settling rather than by
     this. The house is still climbing when the toggle is handed back. Motion
     picks the interruption up from wherever the rise had got to, so an
     impatient second click crossfades from a half-risen house instead of
     snapping. */
  const house = reducedMotion
    ? {
        initial: { y: '0%', opacity: 0 },
        animate: { y: '0%', opacity: 1, transition: { opacity: { duration: 0.25, delay: 0.18 } } },
        exit: { y: '0%', opacity: 0, transition: { opacity: { duration: 0.2 } } },
        transition: { y: { duration: 0 } },
      }
    : {
        /* Far enough down that the roofline is off the bottom of the frame at
           the start, so it genuinely rises into view rather than sliding a short
           way. Percentages resolve against the layer, which is the viewport. */
        initial: { y: '38%', opacity: 0 },
        animate: {
          y: '0%',
          opacity: 1,
          transition: {
            // Hard deceleration: most of the distance is covered early and the
            // last stretch is a long glide into rest, which is what makes it
            // read as floating rather than as being moved.
            y: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.38, delay: 0.14, ease: [0.33, 0, 0.67, 1] },
          },
        },
        /* Leaves in place. Sending the outgoing house downward to meet an
           incoming one coming up would put the two of them in the same band of
           the frame at the same time, which is the overlap this arrangement
           exists to avoid. */
        exit: {
          y: '0%',
          opacity: 0,
          transition: { opacity: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
        },
        transition: {},
      }

  /* The two layers are separate AnimatePresence instances because they live on
     opposite sides of the headline and nothing can be a child of two parents.
     That separation is now also what lets them move differently: both rise, but
     the lot behind the type comes up a tenth of the frame and the house in front
     of it comes up nearly four tenths, so each carries its own motion config
     rather than sharing one. Both are keyed on the same mode and
     both start on the same commit, so the swap is still one event. */
  const layer = (names, className, motionConfig, onComplete) => (
    <div className={`hero__bg ${className}`}>
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={mode}
          className="background-layer"
          initial={motionConfig.initial}
          animate={motionConfig.animate}
          exit={motionConfig.exit}
          transition={motionConfig.transition}
          onAnimationComplete={onComplete}
        >
          {names.map((name) => (
            <div
              key={name}
              className={`background-plate background-plate--${name}`}
              style={{ backgroundImage: `url(${FRAMES[mode][name]})` }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )

  return (
    /* The wrapper is positioned but deliberately takes no z-index of its own.
       With one it would become a stacking context and seal both layers inside
       it, which is the whole thing this arrangement exists to avoid — the two
       layers have to be sorted against the headline, not against each other. */
    <div className="hero__depth" aria-hidden="true">
      {layer(BEHIND, 'hero__bg--behind', lot, onTransitionComplete)}
      {/* Unlocking is the back layer's job alone. Both fire, and both would
          clear the same latch, but the second call would land after the toggle
          had already been re-armed. The house still outlasts the lot — 0.8s of
          climb against 0.78s — so it is a few frames off its rest when the
          toggle is handed back, which is deliberate and covered at the bottom of
          the `house` config. Both land well inside App's 1200ms fallback. */}
      {layer(IN_FRONT, 'hero__bg--front', house)}
    </div>
  )
}

export default BackgroundTransition
