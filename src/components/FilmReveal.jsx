import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Volume2, VolumeX } from 'lucide-react'
import { getLenis, scrollTo } from '../smoothScroll.js'
import { documentTop, onMeasure, onScroll } from '../scrollCoordinator.js'
import { WIDE_STAGE } from '../breakpoints.js'
import '../styles/film.css'

/* ============================================================
   The film — a seam you open rather than scroll past
   ============================================================

   The page explains itself before this point and proves itself after: the
   ledger says what the system does, Our Cases says who it did it for. Between
   the two there was nothing showing the thing actually running, and a section
   that simply parked a video card in the flow would have been a third
   explanation rather than a break from them.

   So the video is not a card on the page. It is a screen the page opens.

   Three states, and the scroll only ever moves between them one at a time:

   A  at rest. The section is flush at the top of the frame, the heading holds
      the upper third, and the footage is a wide strip below it — cropped to a
      trailer, deliberately not the whole picture.
   B  open. One gesture and the strip becomes the viewport: the crop unwinds to
      full bleed and the footage pushes in as it goes. Nothing else is on
      screen. The page has stopped being a page.
   C  gone. The next gesture hands the scroll back and lands Our Cases flush at
      the top, on the frame that section starts from.

   None of the three can be parked between. That is the rule the quote →
   testimonials seam already runs on (see sectionSnap.js) and it is here for
   the same reason: every scroll position between an inset card and a
   full-bleed one shows a rectangle mid-flight, which is not a composition
   anybody chose.

   The opening itself is not scrubbed. A scrubbed zoom ties the image to the
   wheel, and a wheel is not a dolly — it arrives in notches, it overshoots,
   and half the visitors have a trackpad that will land them at 43% of the way
   open and leave them there. One gesture is spent, the page takes it, and the
   screen opens on its own timing. What the visitor controls is whether it
   opens, not how fast.

   ------------------------------------------------------------

   How the opening is drawn, which is the part worth being careful about.

   The frame is always exactly the viewport. It never resizes. What changes is
   a scale on it that shrinks it to the card's edges and back — cropping rather
   than resizing, because `overflow: hidden` does the cutting and the media
   inside undoes the scale so the footage never squashes — and a second scale
   on the player that pushes from 1 to just over.

   Every one of those is a transform, which matters twice. The iframe is never
   handed a new size, and a YouTube player asked to relayout sixty times a
   second drops the video while it does it — precisely the frame the effect
   exists to show. And transforms are composited, so the opening runs on the
   compositor thread rather than in the repaint budget: it survives a main
   thread busy with the scroll that triggered it, which the clip-path this was
   drawn with first did not. See film.css. */

const VIDEO_ID = 'sYIGiuycD-k'

/* nocookie because there is no reason for a background loop on a marketing
   page to seed an ad profile. `mute` is not a preference — autoplay does not
   exist without it — and `loop` on a single video needs `playlist` naming that
   same video, which is YouTube's own oddity rather than a typo here.
   `enablejsapi` is what lets the sound button below talk to the player. */
const EMBED = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?${[
  'autoplay=1',
  'mute=1',
  'loop=1',
  `playlist=${VIDEO_ID}`,
  'controls=0',
  'modestbranding=1',
  'rel=0',
  'playsinline=1',
  'disablekb=1',
  'iv_load_policy=3',
  'enablejsapi=1',
].join('&')}`

const PLAYER_ORIGIN = 'https://www.youtube-nocookie.com'

/* The glide, matched to the CSS that opens the screen. They are two separate
   timelines — one is Lenis moving the document, one is the compositor
   opening the frame — and they only read as one movement if they start
   together and end together. Kept a shade under the CSS duration so the scroll
   has certainly landed by the time the image stops moving; the reverse reads
   as the page still settling after the picture has arrived. */
const DURATION = 0.95
const easeOut = (t) => 1 - Math.pow(1 - t, 4)

/* How long the page is held on the mark after a movement has landed, before
   the scroll is handed back.

   Long enough to outlast the gesture that triggered it, because that gesture
   is usually still arriving when the movement ends — a trackpad flick easily
   outlives a second. Held rather than merely ignored: the leftovers do not
   only read as a fresh intent, they are still scroll, and letting Lenis spend
   them slides the page off the frame it has just been landed on. That is what
   put a visitor between the open screen and Our Cases, looking at half of
   each. */
const REARM_MS = 320

/* How long the section is left alone after it lands flush, before the gesture
   that opens it will be read.

   This is what makes A a state rather than a waypoint. Landing and opening used
   to be one movement — the code said so, and it contradicted the header three
   screens above it, which promises three states the scroll moves between one at
   a time. In practice the screen went full-bleed while the visitor was still
   arriving at the section, so the resting frame the whole composition is built
   around, heading over a cropped strip, was never on screen long enough to be
   read. Neither was the cue that says "Scroll to open", which is the one thing
   telling them the gesture exists.

   Longer than REARM_MS on purpose. A hard flick outlives the glide easily, and
   at 320ms the page is handed back while there is still enough of it left to
   be read as a fresh intent — which would re-collapse the two gestures into
   one for exactly the visitors moving fast enough not to have seen the frame.
   Half a second is enough for
   the momentum to die and for the strip to register, and short enough that
   somebody who means to open it is not left pushing at a page that ignores
   them. */
const SETTLE_MS = 520

/* How much of the section is still below the fold when the page takes over.

   It was nearly half, and half is too early: the strip was opening while the
   ledger above it was still on screen, so the move began before the thing it
   was moving had finished arriving. At 0.15 the section is all but framed —
   the heading is settled, the strip is whole, and the takeover reads as the
   answer to a gesture that had already brought the visitor here rather than as
   the page grabbing at one still in progress.

   The landing glide is only that much travel long now, so nearly all of the
   movement is the screen opening. That is the right division: the scroll's job
   is to finish the arrival, not to be the effect. */
const ENTER_LEAD = 0.15

/* How far below the next section's top an upward gesture will still be caught
   and returned to the open screen. Wider than the entry lead, because coming
   back is a coarser intention than arriving. */
const RETURN_LEAD = 0.5

/* ------------------------------------------------------------
   Browsing, or going somewhere
   ------------------------------------------------------------

   A seam that catches every gesture crossing it catches the ones that were
   never about it. Flick up hard from the testimonial wall and the page passes
   through this section on its way to the top — and the seam, which only ever
   sees "an upward scroll, inside the band", would take that gesture over and
   land the visitor on a video they were scrolling away from. It reads as being
   thrown, because that is what it is.

   The two cases are not told apart by direction or position — those are
   identical — but by how far the page has already come without stopping. So
   the distance travelled in the current unbroken run of scrolling is kept, and
   anything past a couple of viewports is treated as a journey rather than a
   browse and left alone.

   A run ends when the scroll events stop arriving. Lenis emits one per frame
   while it is moving, so a gap longer than a few frames means the page came to
   rest, and the next gesture starts its own run. That is what makes several
   deliberate flicks up through Our Cases still land here, while one hard flick
   from four sections down does not.

   Upward only. The asymmetry is the point rather than an oversight: on the way
   down this section is the destination, and somebody moving fast through the
   page is exactly who should be stopped and shown it. On the way up it is
   scenery on the route to somewhere else. */
const JOURNEY = 2

/* A pause longer than this ends the run. Three or four frames — long enough
   not to be tripped by a dropped frame mid-gesture, short enough that the
   let-go between two flicks separates them. */
const RUN_GAP_MS = 180

/* Opening and closing in place, where the document does not move at all and
   there is therefore no glide to hang the lock on. Lenis is stopped outright
   for this long rather than sent on a zero-length journey, because a scrollTo
   already at its target completes on the next frame and would hand the gesture
   back in the middle of the animation. */
const HOLD_MS = 1000

/* Anything closer than this counts as being on the number. Sub-pixel scroll
   positions are the norm with momentum scrolling, so an equality test against
   a measured offset is a test that never passes. */
const EPSILON = 4

/* How far the page may have slid from the mark and still count as standing on
   it, once the screen is open. Wide, because it is answering "is the visitor
   still at the film" rather than "is the page on the exact number" — and while
   the screen is open the nearest other thing to be at is a whole viewport
   away, so there is nothing for a quarter of one to be confused with. */
const NEAR_MARK = 0.25

/* Below this there is no gesture to read — the page is drifting, or the number
   is the tail of something already spent. */
const QUIET = 0.05

function FilmReveal() {
  const rootRef = useRef(null)
  const frameRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [muted, setMuted] = useState(true)

  /* The seam reads and writes this on the scroll thread, where a state value
     captured in a closure is a frame or two stale and one stale read is a
     double-open. State is still what renders; the ref is what decides. */
  const expandedRef = useRef(false)

  const command = useCallback((func) => {
    const win = frameRef.current?.contentWindow
    if (!win) return
    win.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      PLAYER_ORIGIN,
    )
  }, [])

  /* Closing silences the player here rather than in an effect watching the
     flag, and the difference is not stylistic: sound belongs to the open
     screen, so the silencing is part of the closing rather than a consequence
     of it that React gets around to on the next commit. Leaving a video
     talking while its strip is a thumbnail three sections up the page is the
     single most complained-about behaviour on the web, and it should not be
     one render behind the thing that caused it. */
  const setOpen = useCallback(
    (next) => {
      expandedRef.current = next
      setExpanded(next)
      if (!next) {
        command('mute')
        setMuted(true)
      }
    },
    [command],
  )

  /* The player is not mounted with the page. It is a third-party iframe that
     pulls a player bundle and starts decoding video the moment it exists, and
     it sits below two full sections most visitors are still reading. Mounted a
     viewport early instead — far enough out that it is warm and playing by the
     time the strip appears, late enough that it costs the top of the page
     nothing at all. */
  const [mounted, setMounted] = useState(
    /* No observer, no deferral. Better one eager iframe than a section that
       is permanently a poster because the mechanism that was supposed to
       mount it does not exist here. */
    () => typeof IntersectionObserver === 'undefined',
  )
  useEffect(() => {
    const root = rootRef.current
    if (!root || mounted) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setMounted(true)
        io.disconnect()
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [mounted])

  /* Whether the section is the thing being looked at, which is a different
     question from whether the screen is open and has to be asked separately.

     `expanded` stays true after the seam has moved on to Our Cases, and that is
     deliberate — it is what makes scrolling back up return to the frame that
     was left rather than to a strip that has quietly reset itself. But it
     means the flag is true for the whole of the rest of the page, so anything
     reading it as "the film is filling the viewport" is wrong everywhere below
     here. The contact dock was, and hid itself from Our Cases to the footer.

     Half the section, because while the screen is open the page is pinned to
     the section's own top and it is the entire viewport; once the seam has left
     for Our Cases it is none of it. There is nothing in between for a
     threshold to be delicate about. */
  const [onScreen, setOnScreen] = useState(false)
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.5 },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [])

  const toggleSound = useCallback(() => {
    const next = !muted
    command(next ? 'mute' : 'unMute')
    /* Unmuting a player that autoplayed muted does not always resume it: some
       browsers pause a muted autoplay the moment it gains audio, and a button
       that silences the picture as well as un-silencing it reads as broken. */
    if (!next) command('playVideo')
    setMuted(next)
  }, [command, muted])

  /* ----------------------------------------------------------
     The seam
     ---------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === 'undefined') return

    /* The same gate the closing sequence's push runs behind. Under reduced
       motion, a section that takes the scroll away and animates a screen open
       is not a gentler version of the complaint — it is the complaint. Below
       the wide stage there is no room for a heading and a strip to be two
       things rather than one, so the section lays out as an ordinary video
       block and the stylesheet never arms any of this either.

       Pairs with the @media block in film.css. */
    const mq = window.matchMedia(WIDE_STAGE)
    let detach = null

    const arm = () => {
      const root = rootRef.current
      if (!root) return null

      let busy = false
      let failsafe = 0

      /* The section's top and the top of whatever follows it, in document
         coordinates, cached between layouts. Neither moves while the page
         scrolls, and neither moves when the screen opens either — the stage
         keeps its height and only the clip-path and the scale inside it
         change. See scrollCoordinator.js. */
      let a = 0
      let b = 0

      const stopMeasuring = onMeasure(() => {
        a = documentTop(root)
        const after = root.nextElementSibling
        b = after
          ? documentTop(after)
          : a + root.getBoundingClientRect().height
      })
      /* The current run: how far it has come, and when it was last heard from.
         See JOURNEY above. */
      let travel = 0
      let lastTick = 0

      /* Parked at A, closed, with the strip on screen — the state between
         arriving at the section and spending a gesture on opening it. */
      let landed = false

      /* Hand the scroll back — but not until the page has stood still on
         `mark` for `quiet` milliseconds.

         Frozen for that window rather than merely ignored, and the difference
         is the whole of a real bug. Dropping `busy` the moment a glide lands
         stops *this handler* reading the leftovers of the gesture that caused
         it; it does nothing about Lenis, which still has them and still
         applies them. A hard flick outlives a one-second glide easily, and the
         page went on sliding out of the frame it had just been set down on —
         parking the visitor between the open screen and Our Cases, which is
         the one state the section is built to make unreachable.

         Lenis drops wheel input outright while it is stopped, so the leftovers
         die here instead of being spent. The re-pin on the way out is for what
         arrives in the meantime by other means; it costs nothing when there is
         nothing to correct. */
      const handBack = (mark, quiet) => {
        const lenis = getLenis()
        lenis?.scrollTo(mark, { immediate: true, force: true })
        lenis?.stop()
        clearTimeout(failsafe)
        failsafe = setTimeout(() => {
          lenis?.scrollTo(mark, { immediate: true, force: true })
          lenis?.start()
          busy = false
          /* The run starts again from here. What the page just moved was its
             own doing, and charging the visitor for it would count a glide of
             one viewport against the two they are allowed before the next
             gesture is read as a journey. */
          travel = 0
          lastTick = 0
        }, quiet)
      }

      /* Move the page and open or close the screen on the same tick. `lock` is
         what makes this a seam rather than a suggestion — the rest of the
         gesture is dropped instead of fighting the glide — and `force`
         overrides Lenis's own guard against travelling somewhere it believes
         it already is, which is exactly the case at both ends of the range. */
      const glide = (to, open, quiet = REARM_MS) => {
        busy = true
        if (open !== undefined) setOpen(open)
        clearTimeout(failsafe)
        /* A floor under the lock. onComplete is the normal way out and it does
           fire, but it belongs to an animation something else can interrupt —
           another scrollTo, a teardown mid-glide — and a seam that never
           re-arms is a page that has quietly stopped scrolling.

           Both paths can fire — onComplete normally, the failsafe if the glide
           is interrupted — and `handBack` clears whichever timer is standing
           before setting its own, so arriving twice costs nothing. */
        const done = () => handBack(to, quiet)

        failsafe = setTimeout(done, DURATION * 1000 + 500)
        scrollTo(to, {
          duration: DURATION,
          easing: easeOut,
          lock: true,
          force: true,
          onComplete: done,
        })
      }

      /* Opening or closing on the spot, where the document does not move and
         there is no glide to hang the lock on — the freeze `handBack` does is
         the whole mechanism here rather than a tail on the end of one. */
      const hold = (mark, open) => {
        busy = true
        setOpen(open)
        /* `handBack` puts the page on the mark before freezing it, not merely
           wherever the gesture had got to — which matters most here, because
           this runs a frame or two after the scroll began and in that time
           Lenis has already carried the page some way off the number it was
           being held on. Freezing there would leave the section sitting a
           little low for the whole of the transition. The correction lands on
           the same frame the screen starts moving, which is the one frame
           nobody is looking at the edges. */
        handBack(mark, HOLD_MS)
      }

      const onFrame = (y, delta, velocity) => {

        /* Measured on every scroll, including the ones this handler is going
           to ignore. A run that is only counted while the seam is armed is a
           run that resets itself every time the page glides, which is the one
           moment it is certainly still moving. */
        const now = performance.now()
        travel = now - lastTick > RUN_GAP_MS ? Math.abs(delta) : travel + Math.abs(delta)
        lastTick = now

        /* `busy` covers the whole of a movement and the quiet window after it,
           because the page is frozen for both — there is no longer a period
           where the handler is deaf but the scroll is not. */
        if (busy) return

        /* `a` and `b` come from the cache above, re-read whenever anything
           that moves them moves them — a font settling, an image arriving, a
           resize, a pin rebuilding. The far mark is the next section's own top
           rather than this one's bottom: they are the same number today and
           they stop being the same number the first time anything below grows
           a margin. */
        const viewport = window.innerHeight

        /* Lenis reports where the visitor's target is heading rather than
           where the document happens to have got to, which is the better of
           the two signals — but it is not always awake. A short gesture on a
           busy frame can start and finish between two notifications, and by
           the time this runs Lenis has settled and reports nothing. The
           frame-to-frame delta stands in when that happens: a weak reading of
           the right direction beats a confident reading of no direction.

           Both are sampled once per frame by the coordinator and shared with
           the other seam, rather than each asking separately. */
        const intent = Math.abs(velocity) >= 0.4 ? velocity : delta
        if (Math.abs(intent) < QUIET) return
        const down = intent > 0

        /* Whether an upward gesture is close enough to this section to be
           about it, and short enough to be a browse rather than a journey.
           Both have to hold; see JOURNEY. */
        const returning =
          !down && y < b + viewport * RETURN_LEAD && travel < viewport * JOURNEY

        if (!expandedRef.current) {
          /* Standing at A with the strip on screen. This is the gesture the
             header promises: one movement, spent entirely on opening the
             screen. It is deliberately not the same gesture that brought them
             here — see SETTLE_MS. */
          if (landed) {
            if (down) {
              landed = false
              hold(a, true)
              return
            }
            /* Turned around at the resting frame. They have seen it and
               decided against it, so the scroll goes back to them rather than
               holding them against a section they are leaving. */
            landed = false
            return
          }

          /* Arriving from the ledger above, far enough in that the strip is
             what the frame is about. This gesture buys the landing only. The
             strip has to be legible, and the cue under it readable, before the
             next one is allowed to spend the section. */
          if (down && y > a - viewport * ENTER_LEAD && y < b - EPSILON) {
            landed = true
            /* Already flush — nothing to travel, so hold the settle directly
               rather than gliding zero pixels to earn it. Held rather than
               counted down, for the same reason every other wait here is: the
               gesture that brought them this far is still arriving, and a page
               that is merely deaf to it still moves under it. */
            if (Math.abs(y - a) < EPSILON) {
              busy = true
              handBack(a, SETTLE_MS)
              return
            }
            glide(a, undefined, SETTLE_MS)
            return
          }

          /* Coming back up to it, on a page that was reloaded deep or jumped
             to by anchor. Symmetric with the above rather than merely tidy:
             without it the section is a seam in one direction and a black
             rectangle in the other. It lands closed for the same reason — an
             arrival is an arrival whichever side it came from. */
          if (returning && y > a + EPSILON) {
            landed = true
            glide(a, undefined, SETTLE_MS)
          }
          return
        }

        /* Open, and standing on the mark — which is the only place the page
           can be while the screen is open, unless something carried it off.

           A band rather than the epsilon, and the difference is not caution.
           The page is held at the mark exactly, but the first scroll event of
           the next gesture does not arrive until Lenis has already eased ten
           or twenty pixels away from it: by the time this handler can ask, the
           page is never still on the number it was left on. Tested against a
           few pixels, every gesture from the open screen falls through to the
           branches meant for a page that has been carried somewhere else — the
           screen closes itself and the scroll runs free, which is precisely
           the two things this is here to prevent. */
        if (Math.abs(y - a) < viewport * NEAR_MARK) {
          if (down) {
            /* On to Our Cases, and the screen stays open behind it: coming
               back up should return to the frame that was left, not to a strip
               that has quietly reset itself while nobody was looking. */
            if (y > a - EPSILON) {
              landed = false
              glide(b)
            }
            /* Above the mark and heading down. Whatever put the page here, it
               was not this seam, so the open state is stale — dropped, and the
               ordinary arrival below lands them at the resting frame again a
               moment later, from which a gesture reopens it. */
            else setOpen(false)
            return
          }

          /* Up, and browsing: close it. The gesture is spent on the closing
             and the scroll is handed back after, so the next one carries on
             into the ledger with nothing in the way. */
          if (returning) {
            /* Back to the resting frame rather than out of the section. That
               is state A again, so the next gesture down opens it again — it
               does not fall through to Our Cases. */
            landed = true
            hold(a, false)
          }
          /* Up, and travelling. Do not stop the page — but the screen cannot
             stay open behind a visitor who is leaving, so it is closed without
             touching the scroll and they carry on through. */
          else {
            landed = false
            setOpen(false)
          }
          return
        }

        /* Open, and somewhere else. Either a gesture is bringing them back to
           it, or something already carried them off it. */
        if (returning && y > a) {
          glide(a)
          return
        }

        /* Open, below the mark, and still going down. The seam did not put
           them here — it only ever leaves the mark for Our Cases, flush — so
           something else did: the tail of a gesture that outlived the freeze,
           an anchor, a restored scroll position. Whatever it was, the page is
           now parked between the two frames with the screen still open behind
           it, which is the exact composition the whole section exists to make
           unreachable. Finish the move it was going to make. */
        if (down && y > a && y < b) {
          landed = false
          glide(b)
          return
        }

        /* Above the section entirely: the open screen belongs to the mark and
           they are past it. Dropped rather than glided back, so a flick to the
           top stays a flick to the top — and so the next arrival from above is
           an opening again rather than a page that believes it is already
           open and answers the gesture by leaving for Our Cases. */
        if (y < a - viewport * NEAR_MARK) {
          landed = false
          setOpen(false)
        }
      }

      const stopScrolling = onScroll(onFrame)

      return () => {
        stopScrolling()
        stopMeasuring()
        clearTimeout(failsafe)
        /* Torn down mid-glide, hand the scroll back: Lenis holds the lock
           until the animation it is running finishes, and there will be
           nothing left to finish it. */
        getLenis()?.start()
      }
    }

    const sync = () => {
      detach?.()
      detach = mq.matches ? arm() : null
      /* Dropping below the stage mid-session leaves the screen open with
         nothing left that can close it. */
      if (!mq.matches) setOpen(false)
    }

    sync()
    mq.addEventListener('change', sync)

    return () => {
      mq.removeEventListener('change', sync)
      detach?.()
    }
  }, [setOpen])

  /* A full-bleed screen with no visible chrome needs a way out that is not the
     scroll wheel, and Escape is the one every visitor already has. */
  useEffect(() => {
    if (!expanded) return
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded, setOpen])

  return (
    <section
      className="film"
      ref={rootRef}
      data-expanded={expanded ? 'true' : 'false'}
      /* Published for anything outside this section that needs to know the
         open screen is actually covering the frame — see contact-dock.css. */
      data-onscreen={onScreen ? 'true' : 'false'}
      aria-labelledby="film-title"
    >
      <div className="film__stage">
        <div className="film__intro">
          <h2 className="film__title" id="film-title">
            The whole system, in motion
          </h2>
          <p className="film__lede">
            Panels on the roof, the Smart Controller in the hall, and a meter
            that has stopped moving.
          </p>
          <p className="film__cue" aria-hidden="true">
            Scroll to open
            <ChevronDown size={15} strokeWidth={1.75} />
          </p>
        </div>

        {/* Always the size of the stage. Only the clip-path on it and the
            scale inside it ever change — see the header of this file. */}
        <div className="film__frame">
          <div className="film__media">
            {mounted && (
              <iframe
                ref={frameRef}
                src={EMBED}
                title="Solar energy, start to finish"
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                /* The player has no controls and takes no keyboard input
                   here; the sound button beside it is the whole interface,
                   and a tab stop that lands inside a chromeless iframe is a
                   focus ring nobody can see and cannot get out of. */
                tabIndex={-1}
              />
            )}
          </div>
        </div>

        <button
          className="film__sound"
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
        >
          {muted ? (
            <VolumeX size={19} strokeWidth={1.6} aria-hidden="true" />
          ) : (
            <Volume2 size={19} strokeWidth={1.6} aria-hidden="true" />
          )}
          <span className="film__sound-label">
            {muted ? 'Sound off' : 'Sound on'}
          </span>
        </button>

        <p className="film__exit" aria-hidden="true">
          Scroll to continue
        </p>
      </div>
    </section>
  )
}

export default FilmReveal
