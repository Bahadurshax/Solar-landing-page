import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight } from 'lucide-react'
import EditorialPanel from './EditorialPanel.jsx'
import {
  FINE_POINTER,
  MOTION_OK,
  NO_MOTION,
  WIDE_VIEWPORT,
} from '../breakpoints.js'
import '../styles/how-it-works.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ============================================================
   How It Works - the ledger
   ============================================================

   Four hairline rows and nothing else in flow. The photograph is not in the
   layout at all: it is carried on the pointer, so the rows stay type and the
   pictures belong to the hand.

   This replaces a pinned stage of four stacking cards. The stage was the
   section's whole argument and it cost a full viewport of pinned scroll to
   make it, on a page that only has three such moments to spend. Giving one
   back to About and the closing sequence is most of why this exists.

   What the photograph gains by moving onto the pointer is size and freedom;
   what the rows gain is that nothing sits on top of a picture. Live text over
   photography always needs a scrim, and a scrim is a permanent tax on
   legibility paid for an effect that lasts as long as a hover. */

const STEPS = [
  {
    number: '01',
    title: 'Capture sunlight',
    copy: 'High efficiency panels take in more of the one thing that matters.',
    image: '/images/solar-capture-day.png',
    alt: 'A modern home at golden hour with high-efficiency solar panels across its roof.',
  },
  {
    number: '02',
    title: 'Control every watt',
    copy: 'The Smart Controller manages and optimises the flow in real time.',
    image: '/images/smart-controller.png',
    alt: 'The white Smart Controller unit mounted in a minimal grey interior.',
  },
  {
    number: '03',
    title: 'Power the whole home',
    copy: 'Energy runs everything that matters, through the night as well as the day.',
    image: '/images/solar-home-night.png',
    alt: 'A solar-powered home at night with warmly illuminated windows.',
  },
  {
    number: '04',
    title: 'Lock in $0 bills',
    copy: 'No electricity bill for seven years. Guaranteed, in writing.',
    image: '/images/solar-house-night.png',
    alt: 'The house at night, lit from inside.',
  },
]

/* How hard the picture chases the pointer, per frame. The lag is the whole
   character of the thing: at 1 it is glued to the cursor and reads as a
   cursor, and below about 0.08 it arrives late enough to feel broken. */
const CHASE = 0.14

/* Under a tenth of a pixel of travel left. Below this the loop stops rather
   than spending frames on motion nobody can see. */
const SETTLED = 0.1

/* How far the picture stands off the pointer, measured from its own edge.

   It used to be centred on the cursor, and had to be hidden whenever the hand
   went near Learn more, because anything the pointer is aimed at was
   underneath it. Standing it beside the hand removes the collision rather than
   working around it: the control is never covered, the row it belongs to stays
   readable while it is being read, and the picture stops behaving like an
   oversized cursor. */
const CARRY_GAP = 34

/* The side it stands on is eased rather than switched, and much more slowly
   than the chase, so crossing the middle of the section reads as the picture
   swinging around the hand rather than jumping through it. */
const SWING = 0.06

function HowItWorks() {
  const rootRef = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(rootRef)
      const rows = q('[data-rows]')[0]
      const carrier = q('[data-carrier]')[0]
      const shots = q('[data-shot]')
      const items = q('[data-row]')
      const words = q('[data-word]')
      const editorial = q('.editorial')[0]
      const mm = gsap.matchMedia()

      /* ---------- the sentence lights up, word by word ----------

         It used to be seeked from the pinned card sequence's own progress.
         There is no pin here to hang it on, so it gets a trigger of its own
         across its own height, which is what the narrow branch always did.

         Scrubbed rather than played: this is the one thing in the section that
         tracks the scroll continuously, and it is what stops four hairline
         rows on an empty ground from arriving completely inert. */
      mm.add(MOTION_OK, () => {
        gsap.set(words, { opacity: 0.15 })

        /* The rows start hidden, and this is the line that was missing.

           They were being hidden by the entrance tween itself with
           `immediateRender: false`, which defers the start state until the
           tween actually runs. That was there so a trigger which never fired
           could not strand four invisible rows on the page. It also meant the
           rows were plainly visible right up until the moment they were
           supposed to fade in, which is the bug: by the time the sentence had
           finished lighting, the list it was meant to introduce had been on
           screen for half a viewport already.

           Hidden here instead, up front, and the safety is bought back below
           with a second trigger rather than by deferring the state. */
        /* 14px rather than 26. The rows are full-bleed and hairline-separated,
           so a long rise makes the whole line look like it is sliding into
           place; a short one reads as it settling. */
        gsap.set(items, { opacity: 0, y: 14 })

        /* Built paused. Nothing about when it plays is a scroll position on
           this tween: it is started by whichever of the two triggers below
           reaches it first, and playing an already-running tween is a no-op,
           so they cannot fight. */
        const intro = gsap.to(items, {
          opacity: 1,
          y: 0,
          /* Just over one row in flight at a time.

             Duration over stagger is how many are mid-fade at once, and both
             extremes are wrong here. At ten they arrived together. Below one,
             which is where this was, each row finished and the page sat still
             for a sixth of a second before the next started: the sequence was
             legible but it stuttered, because nothing was moving during the
             gaps.

             At 1.25 there is always exactly one row arriving and the next has
             just begun, so the cascade never stops moving and never collapses
             into a single event. */
          duration: 0.5,
          stagger: 0.4,
          /* Softer than power3, which front-loads almost all of its travel and
             makes a short move look like a snap. */
          ease: 'power2.out',
          /* Enough of a beat that the sentence has clearly finished, not enough
             to read as the section having stopped. */
          delay: 0.1,
          paused: true,
        })

        const startRows = () => intro.play()

        /* Word by word, and these two numbers are the whole of it.

           It used to carry a stagger of 0.4 spread across every word while
           each word kept the default half-second fade. The gap between two
           neighbours was therefore about a fiftieth of the time either of them
           took to arrive, so the entire sentence was mid-fade at once and it
           read as one wash moving over the block rather than as words lighting
           up in turn.

           Under a scrub the absolute values mean nothing: the whole timeline
           is stretched across the scroll window whatever its length. Only the
           ratio survives, and it is the ratio that decides what this looks
           like. Read it as how many words are mid-fade at any moment, which is
           simply duration divided by stagger.

           Well under one and each word snaps on and waits its turn, which is
           sequential but has no transition left in it. Far above one and every
           word is fading at once, which is the wash this started as. Here it
           is about one and a half: each word takes visibly longer to arrive
           than the gap to its neighbour, so a word is always still coming up
           as the next one starts and the light travels along the line. */
        const reveal = gsap.to(words, {
          opacity: 1,
          ease: 'none',
          duration: 0.14,
          stagger: { each: 0.09 },
          /* The window, and it is the close that matters rather than the open.

             This began at 82% and ended at 58%, which read as too early. The
             start was not really the fault: the whole reveal was crammed into
             a quarter of the viewport, so the words lit and finished while the
             sentence was still a strip near the bottom edge.

             A scrubbed reveal has no speed of its own. It is spread across
             whatever scroll distance the window covers, so pace is set here
             and nowhere else: a wider window is slower, a narrower one faster,
             and the per-word numbers above do not touch it.

             The open sits at 88%, earlier than it has ever been, so the first
             word catches as the sentence crosses the bottom edge. The close at
             38% is what keeps that from turning into a crawl. Together they
             give a window about half a viewport plus the sentence's own
             height, which is wide enough that the words are still arriving
             while it climbs and tight enough that it is done before the
             sentence gets near the top.

             The scrub is the last of it. At 1.3 the words trail the scroll by
             enough to read as being lit rather than switched, and the reveal
             keeps moving for a moment after the page stops. */
          scrollTrigger: {
            trigger: editorial,
            start: 'top 88%',
            end: 'bottom 38%',
            scrub: 1.3,
            /* The sequence. The last word lands, the scroll crosses the end of
               this window, and the list starts building underneath it. */
            onLeave: startRows,
          },
        })

        /* The safety, and the reason hiding the rows up front is now allowed.

           The sequence above depends on the sentence's window being measured
           correctly. If anything leaves that trigger stale, `onLeave` never
           arrives and four invisible rows sit on the page forever, which was
           exactly the failure this section already had once.

           So the rows get a second, independent way in: the moment they are
           halfway up the screen they play regardless of what the sentence is
           doing. In normal use the sentence finishes first and this never
           fires. When it does fire, the worst case is a cascade that starts
           early rather than a section that does not exist. */
        const safety = ScrollTrigger.create({
          trigger: rows,
          start: 'top 55%',
          once: true,
          invalidateOnRefresh: true,
          onEnter: startRows,
        })

        return () => {
          reveal.scrollTrigger?.kill()
          safety.kill()
          intro.kill()
          gsap.set(words, { clearProps: 'opacity' })
          gsap.set(items, { clearProps: 'opacity,transform' })
        }
      })

      /* Nothing to reveal if the sentence is not allowed to move. Set outright
         rather than left alone, because the tween above may have dimmed the
         words before the preference changed. */
      mm.add(NO_MOTION, () => {
        gsap.set(words, { opacity: 1 })
      })

      /* ---------- the carried photograph ----------

         Only where there is a pointer precise enough to carry something with
         and a viewport wide enough for it to travel in. Everywhere else the
         stylesheet puts the picture back into the row as a thumbnail, which
         is a real layout rather than the effect switched off. */
      mm.add(
        `${FINE_POINTER} and ${WIDE_VIEWPORT} and ${MOTION_OK}`,
        () => {
          const target = { x: 0, y: 0 }
          const current = { x: 0, y: 0 }
          let tilt = 0
          let frame = 0
          let carrying = false

          /* The stand-off, held separately from the chase so the two can run
             at different speeds: the picture follows the hand quickly and
             changes sides slowly. */
          let standTarget = 0
          let standCurrent = 0

          /* Measured rather than read per frame. offsetWidth forces layout,
             and the carrier only changes width when the viewport does. */
          let half = carrier.offsetWidth / 2
          const measure = () => {
            half = carrier.offsetWidth / 2
          }

          const show = (index) => {
            shots.forEach((shot, i) => {
              shot.dataset.shown = String(i === index)
            })
          }

          const render = () => {
            frame = 0
            const dx = target.x - current.x
            const dy = target.y - current.y
            const moving = Math.abs(dx) > SETTLED || Math.abs(dy) > SETTLED

            const ds = standTarget - standCurrent
            const swinging = Math.abs(ds) > SETTLED

            if (moving) {
              current.x += dx * CHASE
              current.y += dy * CHASE
            } else {
              current.x = target.x
              current.y = target.y
            }

            if (swinging) standCurrent += ds * SWING
            else standCurrent = standTarget

            /* Tilt off horizontal speed only, capped, easing back to level as
               the picture catches up. Sideways travel is the one axis that
               reads as weight being carried. */
            const wanted = gsap.utils.clamp(-12, 12, dx * 0.32)
            tilt += (wanted - tilt) * 0.1

            carrier.style.transform =
              `translate3d(${current.x + standCurrent}px, ${current.y}px, 0)` +
              ` translate(-50%, -50%) rotate(${tilt.toFixed(2)}deg)`

            if (moving || swinging || Math.abs(tilt) > 0.05) {
              frame = requestAnimationFrame(render)
            }
          }

          const wake = () => {
            if (!frame) frame = requestAnimationFrame(render)
          }

          const onMove = (event) => {
            const box = rows.getBoundingClientRect()
            target.x = event.clientX - box.left
            target.y = event.clientY - box.top

            /* Which side it stands on, and then whether that side actually
               has room.

               The default is the side with more space, so the picture is on
               the right through the left half of the section and swings across
               at the middle. The clamp is what stops it going over either edge
               near the ends of a row: it pins the picture's own edge inside
               the section, which on a narrow window can mean it ends up back
               on the side it started from. That is the correct answer. Off the
               edge is worse than close to the hand. */
            const stand = half + CARRY_GAP
            standTarget = gsap.utils.clamp(
              stand - target.x,
              box.width - stand - target.x,
              target.x > box.width / 2 ? -stand : stand,
            )

            /* Placed outright the first time, so the picture appears where the
               hand already is instead of flying in from wherever it was last
               left. The stand-off is placed with it, or the first frame is a
               swing in from under the cursor. */
            if (!carrying) {
              current.x = target.x
              current.y = target.y
              standCurrent = standTarget
              carrying = true
            }

            carrier.dataset.on = 'true'

            wake()
          }

          const onLeave = () => {
            carrying = false
            carrier.dataset.on = 'false'
          }

          const enters = items.map((row, i) => {
            const onEnter = () => show(i)
            row.addEventListener('pointerenter', onEnter)
            return () => row.removeEventListener('pointerenter', onEnter)
          })

          rows.addEventListener('pointermove', onMove, { passive: true })
          rows.addEventListener('pointerleave', onLeave)
          window.addEventListener('resize', measure)
          show(0)

          return () => {
            cancelAnimationFrame(frame)
            rows.removeEventListener('pointermove', onMove)
            rows.removeEventListener('pointerleave', onLeave)
            window.removeEventListener('resize', measure)
            enters.forEach((off) => off())
          }
        },
      )

      /* The remeasure this section needs after images and fonts settle is not
         here any more. `ScrollTrigger.refresh()` is global — it recalculates
         every trigger on the page, not this section's — so two components each
         scheduling one on `load` and again on `fonts.ready` bought four full
         recalculations for a settle that happens once. It is scheduled once, in
         App, and this section is refreshed by it along with everything else. */

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  return (
    <section
      className="how-it-works"
      ref={rootRef}
      aria-label="How it works"
    >
      <div className="how-it-works__inner">
        <EditorialPanel />

        <div className="ledger" data-rows>
          {STEPS.map((step) => (
            <button className="ledger__row" type="button" key={step.number} data-row>
              <span className="ledger__num">{step.number}</span>

              <h3 className="ledger__title">{step.title}</h3>

              {/* Carried on the pointer where there is one, and shown here
                  where there is not. Both live in the markup; the stylesheet
                  decides which is in play. */}
              <figure className="ledger__thumb">
                <img src={step.image} alt={step.alt} loading="lazy" decoding="async" />
              </figure>

              <span className="ledger__copy">{step.copy}</span>

              {/* Not a nested button. The row is already the control, and a
                  second one inside it would be invalid and would shrink the
                  target to the width of two words. */}
              <span className="ledger__more">
                Learn more
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              </span>
            </button>
          ))}

          <div className="ledger__carrier" data-carrier aria-hidden="true">
            {STEPS.map((step) => (
              <img
                key={step.number}
                src={step.image}
                alt=""
                data-shot
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
