import { getLenis, isPageMoving, scrollTo } from './smoothScroll.js'
import { documentTop, onMeasure, onScroll } from './scrollCoordinator.js'
import { WIDE_STAGE } from './breakpoints.js'

/* ============================================================
   The one seam the page does not let you stop inside
   ============================================================

   Between the quote band and the testimonial wall there is nothing to look at.
   The quote band is exactly one viewport tall and the wall begins exactly where
   it ends, so any scroll position between the two shows the bottom of a form
   and the top of a column of strangers' sentences, and neither is a composition
   anybody chose. Every other seam on this page is a move — the house rises, the
   cards pin, the footer pushes — and this one was just the gap between two
   things that happen to be adjacent.

   So the gap stops being scrollable. Scroll into it in either direction and the
   page takes the gesture over and glides the rest of the way — but it glides to
   a composition, and there are two of them here rather than one. Arriving, from
   above or below, lands on the band filling the frame. Leaving it downward
   lands on the wall flush at the top. One gesture, one section: the band is a
   stop on the way, not a wall of the gap to be pushed off.

   That last part is the correction. Both ends used to be treated as ends of a
   single gap, so a downward frame anywhere inside it resolved to the wall — and
   the first downward frame inside it is the one where the visitor has just
   reached the band. Coming down the page you were carried straight through the
   section; the only way to see it was to scroll back up out of the wall.

   Deliberately the only one on the page. Snapping everywhere takes the scroll
   away from the visitor; this takes it for exactly the one viewport where free
   scrolling was showing them nothing.

   ------------------------------------------------------------

   Two positions, both measured rather than assumed:

   A  the top of the quote band, where it fills the frame. Measured live, and it
      has to be: About is pinned above it and the band is pulled up over that
      pin by a margin that section publishes at runtime, so this number does not
      exist until the layout has settled and it moves whenever anything above it
      reflows.
   B  the top of the closing sequence, where the wall sits flush. That is also
      where the footer's push pins, so landing here lands on the exact frame the
      sequence starts from rather than a pixel or two into it. */

/* The glide. Long enough to read as the page moving itself rather than as a
   jump, short enough that a visitor who wants to be further down does not feel
   held. Quartic ease-out: most of the distance early, so it leaves with the
   momentum the gesture had and spends the rest of the time arriving. */
const DURATION = 0.9
const easeOut = (t) => 1 - Math.pow(1 - t, 4)

/* Below this the page is drifting rather than being scrolled, in Lenis's own
   units. It separates the two questions this has to answer: somebody is
   scrolling right now, so follow them — or nobody is, and the page has been
   left inside the seam by something that was not a gesture.

   It is a velocity test rather than a distance one, and that is the correction
   that matters here. An earlier version decided by how far into the gap the
   page had travelled, treating anything short of a few percent as a nudge to be
   pushed back out. But every genuine crossing begins a few pixels inside the
   edge it came through, so that rule read the first frame of each one as an
   accident — and at the top edge it meant a visitor scrolling up out of the
   footer was held against the wall and could not leave. */
const DRIFTING = 0.4

/* After landing, before the seam is armed again. The gesture that triggered the
   glide is usually still going when it finishes — a trackpad flick outlives it
   easily — and those leftover deltas arrive as a fresh scroll the moment the
   lock comes off. Without this pause, a hard flick down can land on the wall
   and be read as a new intent on the very next frame. */
const REARM_MS = 260

/* The same pause, longer, for a landing on the band. It has more to absorb: a
   landing on the wall is the end of the journey and leftover deltas there only
   carry on into the footer, but a landing on the band has another section below
   it, and a tail read as intent takes the visitor straight to it — which is the
   thing this file now exists to stop. Long enough to outlast an ordinary flick,
   short enough that a visitor who genuinely wants to move on is not scrolling
   at a page that ignores them.

   That second half is the whole tension, and it is paid for in something the
   visitor can see: for as long as the hold runs, their scroll is theirs, so the
   page is free to drift into exactly the mid position this file exists to
   prevent before the seam takes it back. Every millisecond here is a
   millisecond of that drift being visible, which is why it is as short as it
   is — long enough to outlast the deltas that survive the glide's own lock, and
   not a frame longer. */
const BAND_HOLD_MS = 180

/* How long after the last declined frame the seam checks where the page
   actually ended up.

   This is what guarantees there is no mid position, and it is a timer rather
   than a rule about frames because of how scrolling ends: the page stops, and
   when it stops it stops sending scroll events. Anything that decides "resolve
   this once things go quiet" from inside a scroll frame is waiting for a frame
   that is not coming. An earlier version of this file did exactly that, and
   halfway across the seam at rest, with nothing scheduled to move it, is the
   position it left the page in.

   So the check is scheduled by the frames that decline to act and runs on its
   own clock. If the page is still inside the seam by then, it resolves.

   It is a floor rather than a debounce, and that distinction was worth a
   visible bug. Rescheduling on every declined frame sounds like the careful
   version — wait until things have settled, then look — but a gesture produces
   frames for as long as its tail lasts, so each one pushed the check further
   away and the page spent the whole tail drifting across the seam in plain
   view before anything moved it. It fires once, as soon as it is allowed to. */
const SETTLE_MS = 140

/* Below this the gap is not the one this was written for — a layout that has
   not settled, a section that failed to render, a viewport short enough that
   the two are overlapping. Better to leave the scroll alone than to drag the
   page toward a number that means nothing. */
const MIN_GAP = 240

/* How far above the band the arrival is allowed to start.

   Crossing A is not an instant the page can catch. Scrolling is sampled once a
   frame, and a gesture at speed covers real distance between two of them, so by
   the time a frame reports the page inside the band it is already tens of
   pixels in — and the glide's first job is then to carry it back out again. The
   visitor sees the seam start from a position nobody asked for.

   So the arrival is armed just before the edge instead of just after it. The
   strip is inside the scroll where the band is already rising over the About
   pin, so landing on A from here finishes a movement that is underway rather
   than interrupting one.

   This number is no longer the whole strip, and that is the fix rather than a
   refinement. It was, and forty pixels is less than a fast gesture covers
   between two frames — so the frame that should have armed the arrival never
   happened on any descent quicker than a nudge, and the page was caught inside
   the band and dragged back up to A against the gesture that put it there. The
   depth is a frame of travel now, read from the gesture itself, and this is the
   cushion on top of it: what the slow approach needs, and what the fast one
   already has in its own speed.

   Downward gestures only, and only when the band is not already the held
   position — otherwise the pixel of jitter under a landing would read as a
   fresh arrival and lock the page for another glide it has already made. */
const ENTRY_LEAD = 40

/* And the ceiling on it, because a frame's travel is a measurement and a
   measurement can be nonsense.

   Not everything that moves the page a long way in one frame is a gesture at
   speed. A scrollbar dragged, a position restored on reload, Home or End, a
   jump from a script: each arrives as a single frame carrying thousands of
   pixels, and a lead that trusts it arms the arrival from most of a screen
   away and hauls the page down to the band from somewhere the visitor never
   asked to leave. Past this the page is not travelling, it is being placed, and
   a seam has no business reaching for it.

   Comfortably above what real input produces — a hard flick is two or three
   hundred pixels in a frame at sixty, more on a slower display — and far below
   what a jump does. */
const ENTRY_MAX = 420

/* How close to an end still counts as standing on it rather than being inside
   the seam.

   Both ends need this and only one of them had it, and that omission is what
   made leaving the band take three or four gestures instead of one.

   A landing is not pixel-exact. The target is a document offset with a fraction
   on it, the browser snaps the scroll it actually applies to a device pixel,
   and `window.scrollY` comes back a fraction either side of the mark. Half of
   those fractions land on the inside — and with the ends read as exact numbers,
   the page was then, by its own reckoning, stopped in the middle of the one gap
   it does not allow anybody to stop in.

   What followed was not a jump, which is why it was easier to feel than to see.
   The settle check fired, found the page "inside", resolved it to the end it
   was already standing on, and re-armed the hold behind that landing — once
   every couple of hundred milliseconds, for as long as the visitor stood there.
   So somebody parked on the band spent most of every second inside a hold that
   exists to absorb the tail of a flick, and their real downward gesture was
   declined as one, then undone by the next settle a moment later. The same
   fraction at the other end sent a landing on the wall back up to the band.

   A fraction of a pixel past the mark is standing on the mark. */
const EDGE_EPS = 4

/**
 * Arms the quote → testimonials seam. Returns a teardown.
 *
 * Runs only where the closing sequence's own push runs (WIDE_STAGE — wide
 * enough for the stage, and no reduced-motion preference). Under reduced motion
 * this is exactly the wrong feature: taking the scroll away from someone who
 * has asked the system to stop moving things by itself is the complaint, not a
 * gentler version of it. Narrow viewports lay the closing sequence out as an
 * ordinary list, where there is no arrival to land on.
 */
export function startSectionSnap() {
  if (typeof window === 'undefined') return () => {}

  const mq = window.matchMedia(WIDE_STAGE)
  let detach = null

  const arm = () => {
    const quote = document.querySelector('.quote')
    const closing = document.querySelector('.closing')
    if (!quote || !closing) return

    let busy = false
    let rearm = 0
    let failsafe = 0

    /* Whether the band is the position the page is currently holding.

       This is what the seam was missing. A and B were treated as the two ends
       of one gap, so any downward frame inside it resolved to B — and the first
       downward frame inside it is the one where the visitor has just arrived at
       the band. Coming from About you were therefore taken straight through the
       section: it was reachable only by scrolling back up out of the wall.

       So the band is a stop rather than a wall of the gap. Arrive from either
       side and the glide lands on A, which is the frame the section was
       composed for; leave downward from there and the next one lands on B. Two
       gestures, two sections, which is what "one gesture, one section" was
       always supposed to mean.

       It is state rather than a comparison of Y against A because landing is
       not pixel-exact — Lenis can settle a fraction either side of the mark,
       and a rule that read "are we standing on A" from the position alone would
       flip on that fraction and either re-snap to the band or skip it. */
    let parked = false

    /* The pending "where did the page actually stop" check. See `SETTLE_MS`. */
    let settle = 0

    /* Re-measured, but on layout change rather than on every frame.

       The original note here was right that these two numbers cannot be read
       once at startup: the quote band is pulled up over the About pin by a
       margin that section publishes while it runs, so the position does not
       exist until the layout has settled and it moves whenever anything above
       it reflows. What it got wrong is that scrolling is one of those things.
       It is not — a pin reserves its space with a spacer, so both offsets hold
       still while About scrubs, and the events that genuinely move them
       (resize, fonts, `ScrollTrigger.refresh()`) are exactly what the
       coordinator re-measures on. Same numbers, read when they change. */
    let a = 0
    let b = 0
    let gap = 0

    const stopMeasuring = onMeasure(() => {
      a = documentTop(quote)
      b = documentTop(closing)
      gap = b - a
    })

    const release = () => {
      clearTimeout(failsafe)
      /* A landing on the band holds longer than a landing on the wall, for the
         reason given at `BAND_HOLD_MS`. `parked` is set when the glide starts,
         so this reads the landing that is finishing rather than the last one. */
      rearm = performance.now() + (parked ? BAND_HOLD_MS : REARM_MS)
      busy = false
      /* One more check behind every landing. A glide that completes normally
         ends on an edge and the check finds nothing to do; a glide that was
         interrupted — by another scrollTo, by the failsafe firing under it —
         ends wherever it got to, and if that is inside the seam this is the
         only thing that will notice. The page is at rest by then, so no scroll
         frame is coming to notice it instead. */
      scheduleSettle()
    }

    /* The form column scrolls inside itself when the window is too short to
       hold every field, and a seam that fires on the first wheel notch would
       put that content out of reach. Where the band cannot hold its own
       contents, the visitor keeps the scroll. */
    const panelScrolls = () => {
      const panel = quote.querySelector('.quote__panel')
      return !!panel && panel.scrollHeight > panel.clientHeight + 2
    }

    const cancelSettle = () => {
      clearTimeout(settle)
      settle = 0
    }

    /* Commit to one end or the other. `intent` is signed — positive downward,
       and anything under `DRIFTING` counts as no intent at all. */
    const glide = (y, intent) => {
      /* No intent: the page was left here rather than brought here — a restored
         scroll position, a resize, a gesture that ran out mid-seam. Resolve to
         whichever end is nearer, which is the least surprising place to be
         moved to when you did not ask to be moved at all. */
      const drifting = Math.abs(intent) < DRIFTING
      const down = drifting ? y - a > gap / 2 : intent > 0

      /* Downward off the band goes on to the wall; a gesture that is anything
         else — arriving downward from About, arriving upward from the wall —
         resolves to the band itself.

         Drift is outside that rule rather than inside it. `parked` describes
         which composition a gesture is leaving, and there is no gesture here to
         leave one, so the nearer end wins — which is what the paragraph above
         promises and what a bare `down && parked` quietly took back: left three
         quarters of the way to the wall by a resize, it answered with a full
         viewport of travel back up to the band. */
      const target = down && (parked || drifting) ? b : a

      /* Never take the scroll away to move the page nowhere. `target` can be
         the end it is already standing on — a landing that settled a fraction
         inside, a drift resolved to the edge it drifted off — and a lock spent
         arriving where you already are is a lock the visitor pays for in
         dropped input and a hold they did not earn. */
      if (Math.abs(y - target) <= EDGE_EPS) return

      /* Claimed on the way, not on the intention. A glide that resolves to the
         end it is already standing on has just returned, and letting it say
         "the band is the held position" on the way out is the skip by a third
         route: a descent at speed that happens to be sampled within a pixel or
         two of A would arm the arrival, decline to move, and leave the page
         holding a band it had not stopped at — so the next frame, already
         inside, reads as a departure and goes on to the wall. What is standing
         on A is settled by the check behind every landing instead. */
      parked = target === a

      busy = true
      cancelSettle()
      /* A floor under the lock. onComplete is the normal way out and it does
         fire, but it belongs to an animation something else can interrupt —
         another scrollTo, a teardown mid-glide — and a seam that never re-arms
         is a page that has quietly stopped scrolling. Failsafe, not mechanism. */
      clearTimeout(failsafe)
      failsafe = setTimeout(release, DURATION * 1000 + 400)

      /* `lock` is what makes this a seam rather than a suggestion: the rest of
         the gesture is dropped instead of fighting the glide. `force` overrides
         Lenis's own guard against scrolling somewhere it believes it already
         is, which matters at the ends of the range. */
      scrollTo(target, {
        duration: DURATION,
        easing: easeOut,
        lock: true,
        force: true,
        /* Not the page moving itself — see `isPageMoving`. This glide is an
           answer to a gesture rather than a journey somewhere, so it must not
           carry the mark that tells the seam to keep its hands off. Its own
           frames are already declined on `busy`. */
        userData: {},
        onComplete: release,
      })
    }

    /* Scheduled by the frames that find the page inside the seam and decline to
       act on it. First one wins: a pending check is never pushed back by a
       later frame, for the reason set out at `SETTLE_MS`.

       It waits out whatever is left of the hold and then goes, rather than
       waiting for quiet — the hold is the only reason those frames were
       declined, so the moment it lifts is the moment there is an answer. In
       the ordinary case a live scroll frame gets there first and this never
       runs at all; it exists for the case where the gesture has ended and no
       further frame is coming. */
    const scheduleSettle = () => {
      if (settle) return
      const wait = Math.max(SETTLE_MS, rearm - performance.now() + 40)
      settle = setTimeout(() => {
        settle = 0
        /* Still on its way somewhere: look again rather than answer. A journey
           through the seam spends longer inside it than this check waits, and
           resolving from in there is the seam stopping a scroll that was going
           somewhere else. Re-scheduling rather than giving up, because the
           thing that resolves the page once the journey ends may well be this
           check — no scroll frame is guaranteed after a landing. */
        if (isPageMoving()) {
          scheduleSettle()
          return
        }
        const y = window.scrollY
        if (busy || gap < MIN_GAP) return

        /* Standing on an end. There is nothing to resolve, and that is exactly
           why this is where the page's own arrivals are noticed.

           `parked` is what tells a departure from the band apart from an
           arrival at it, and every other place it is set needs a frame: a
           gesture that carries on, a glide that lands. A page put on A by
           something that is not a gesture has neither — the estimate button in
           the footer scrolls to `#quote`, which ends exactly on A and then
           stops sending frames, so the flag stayed false and the visitor's next
           downward gesture was read as an arrival at a band they were already
           standing on and answered with the same screen again.

           This runs once the page has stopped, whatever stopped it, which is
           also the only way to tell staying on A from passing through it. */
        if (y <= a + EDGE_EPS) {
          if (a - y < EDGE_EPS) parked = true
          return
        }
        if (y >= b - EDGE_EPS) {
          parked = false
          return
        }

        if (panelScrolls()) return
        /* Live rather than remembered: if a slow gesture is somehow still
           running this follows it, and if nothing is, it reads zero and the
           nearer end wins. */
        glide(y, getLenis()?.velocity ?? 0)
      }, wait)
    }

    const onFrame = (y, delta, velocity) => {
      if (gap < MIN_GAP) return

      /* A scroll the page started is not a gesture into the seam, and the two
         had been the same thing here.

         Everything below reads a position and a direction and assumes somebody
         is behind them. The footer's back-to-top is neither: it is a journey
         from the bottom of the page to the top that happens to pass through
         this viewport, and the seam met it on the way past, took the scroll off
         it and set it down on the quote band. Measured, that button reached the
         top of the page one time in three; the rest of the time it delivered
         the visitor to a form. `#about` from anywhere below it went the same
         way, for the same reason.

         So the seam stands aside for as long as the page is moving itself, and
         leaves the settle check behind it — that is what resolves the page if a
         journey ever does end inside the seam. See `isPageMoving`. */
      if (isPageMoving()) {
        scheduleSettle()
        return
      }

      /* One reading of the gesture, shared by both branches below. Lenis's own
         velocity is the better signal and the frame-to-frame delta stands in
         when Lenis is quiet — the reasoning is at the foot of this function,
         where the fallback was needed first. It is read once here because the
         arrival needs the same answer the departure does: an arrival decided on
         a velocity Lenis had already forgotten was an arrival that never fired,
         and the frame after it is inside the seam. */
      const intent = Math.abs(velocity) >= DRIFTING ? velocity : delta

      /* Above the band, or close enough to its top edge to be standing on it.
         Ordinary scrolling, and also the position the band's own landing leaves
         the page in — a landing settles a fraction either side of the mark and
         both fractions mean the same thing, which is why the edge is read with
         `EDGE_EPS` rather than as an exact number.

         Those two have to be told apart, and proximity alone cannot do it: a
         descent from About passes within a few pixels of A on its way through,
         and if that counted as standing there, the very next frame inside the
         band would read as leaving it and would go on to the wall. That is the
         skip, back again by a subtler route. So it takes stillness as well as
         nearness — and only ever to set the flag, never to clear one the glide
         itself set, so nothing here depends on a quiet frame that may never
         arrive. */
      if (y <= a + EDGE_EPS) {
        /* Never while the seam is the thing doing the moving, and that guard is
           the whole of a bug rather than a precaution.

           The paragraph above promises this only ever sets the flag and never
           clears one the glide set. It did not keep that promise. An arrival
           armed before the edge glides *down onto* A, so every frame of it is a
           frame above A by more than a pixel or two — which is this test,
           passing, on the seam's own movement. The flag the glide had just set
           was cleared by the glide, and survived only if the last resting frame
           happened to be quiet enough for the branch below to set it again.

           When it did not, the band stopped being a stop: the next downward
           gesture was read as another arrival rather than as a departure, so it
           resolved to A, and the visitor stood on the quote band pushing
           downward at a page that kept handing them back the same screen. */
        if (!busy) {
          if (a - y >= EDGE_EPS) parked = false
          else if (Math.abs(velocity) < DRIFTING && Math.abs(delta) < 0.5) {
            parked = true
          }
        }

        /* Coming down onto the band, close enough to it that this gesture is
           the arrival. See `ENTRY_LEAD` — taking it here rather than a frame
           later is the difference between the band arriving and the band
           arriving after a glimpse of the seam below it.

           The strip is a frame's travel deep rather than a fixed distance, and
           that is the correction. `ENTRY_LEAD` alone is 40px, and a gesture at
           speed covers three or four times that between two frames, so every
           descent quicker than a nudge stepped over the strip entirely and was
           caught inside the band instead — by the branch at the foot of this
           function, whose answer for a page that is not parked is A. A is
           behind it by then. Measured, that was 15 to 210 pixels of the page
           travelling *backwards*, against a gesture still going downward, and
           taking the glide's full length to do it.

           So the question is not how close the page is but where the next frame
           puts it: one frame of travel, plus the fixed lead as the cushion that
           covers the slow approach the fast one does not need.

           The larger of the two readings, rather than the one `intent` settles
           on. They disagree while a gesture is still building — Lenis's figure
           is the frame before this one and the delta is this one — and under
           acceleration the delta is the bigger and the truer of the two. Too
           long a lead costs a few pixels of arming early; too short a one is
           the bug this replaces. Bounded either way — see `ENTRY_MAX`. */
        const lead =
          ENTRY_LEAD + Math.min(Math.max(intent, delta), ENTRY_MAX)

        if (!parked && intent >= DRIFTING && a - y <= lead) {
          if (!busy && !panelScrolls()) {
            glide(y, intent)
            /* A glide that commits schedules its own from `release`; one that
               declined to move because the page was already there does not, and
               that is the case this covers. */
            scheduleSettle()
          }
          return
        }

        /* On the mark rather than merely above it. Whether the page is standing
           there or crossing it at speed cannot be told from one frame, so the
           question is left to the check that runs once it has stopped. Further
           up there is nothing to decide and any pending check is dropped. */
        if (a - y < EDGE_EPS) scheduleSettle()
        else cancelSettle()
        return
      }

      /* At the wall or past it: whatever the band was is over. */
      if (y >= b - EDGE_EPS) {
        parked = false
        cancelSettle()
        return
      }

      /* Inside, where the page does not get to stop. Every path from here that
         declines to act leaves the settle check behind it. */
      if (busy) return
      if (panelScrolls()) return

      if (performance.now() < rearm) {
        scheduleSettle()
        return
      }

      /* Which end is the visitor's to decide while they are still scrolling,
         and the page's to decide only once they have stopped.

         Lenis's own velocity is the first source, because it reports where the
         visitor's target is heading rather than where the page happens to have
         got to. But it is not always awake when this runs: a short gesture on a
         busy frame can start and finish between two scroll notifications, and
         by the time the handler is called Lenis has already settled and reports
         nothing. Left there, a gentle nudge up out of the wall would be read as
         no intent at all and answered with the nearest edge — which is the wall
         it was trying to leave.

         So the frame-to-frame delta stands in when Lenis is quiet. It is the
         weaker signal of the two, because it also catches the page's own
         corrections, but between a weak reading of the right direction and a
         confident reading of no direction, the first is the honest one.

         That is `intent`, read at the top of this function — the arrival above
         needs exactly the same fallback for exactly the same reason. */
      glide(y, intent)
    }

    const stopScrolling = onScroll(onFrame)

    return () => {
      stopScrolling()
      stopMeasuring()
      clearTimeout(failsafe)
      clearTimeout(settle)
      /* If the page is torn down mid-glide, hand the scroll back. Lenis holds
         the lock until the animation it is running finishes, and there will be
         nothing left to finish it. */
      getLenis()?.start()
    }
  }

  const sync = () => {
    detach?.()
    detach = mq.matches ? arm() : null
  }

  sync()
  mq.addEventListener('change', sync)

  return () => {
    mq.removeEventListener('change', sync)
    detach?.()
  }
}
