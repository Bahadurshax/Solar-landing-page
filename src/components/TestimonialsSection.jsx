import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import TestimonialCard from './TestimonialCard.jsx'
import { MARQUEE_OK } from '../breakpoints.js'
import { TESTIMONIALS } from '../data/testimonials.js'
import backgroundImg from '../assets/testimonials_background.jpg'
import '../styles/testimonials.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ============================================================
   Testimonials — two rows, running against each other
   ============================================================

   No heading and no introduction. Ten people saying what happened to their
   electricity bill do not need a line of marketing copy explaining that they
   are about to say it, and with the rows floating in the middle of an open
   field the section has one job and performs it without being announced.

   Horizontal rather than vertical, and the axis is the whole difference in
   feel. A column moving against the page's own direction of travel asks to be
   read while it fights the scroll; a row crosses it instead, so the wall reads
   as something passing by while the visitor holds still — and the ground above
   and below it is left open, which is what lets a section with no heading
   still look composed.

   Three things this section owes the reader, and each one is a mechanism
   rather than a good intention:

   1. The rows are time-driven, not scroll-driven. This section arrives on a
      scrubbed zoom of its own, and a marquee tied to scroll position would
      stall dead in exactly that moment — when the page is asking you to look
      at it. Two constant speeds in opposite directions give the wall a life of
      its own that the scroll passes through rather than drives.
   2. The hovered row brakes rather than stops. `pause()` halts the band on
      whatever frame it is handed, which reads as a fault; bleeding the speed
      off over most of a second reads as the row answering the cursor. Same
      brake as the partners band, and the same reasoning — see PartnersDrift.
   3. It only runs where braking is possible. A marquee's defence is that the
      reader can stop it, and that defence does not exist without a pointer.
      Coarse pointers, narrow viewports and anyone who has asked for less
      motion get an ordinary grid of quotes instead — one condition,
      MARQUEE_OK, governing the animation *and* the layout together. The
      previous version gated those two on different queries, which left a wide
      tablet holding a full-bleed wall it had no way to halt.

   ------------------------------------------------------------
   Speed

   Deliberately unequal. Two rows mirroring each other at the same rate read as
   one object hinged along the middle rather than as two, so when the pair is
   retimed both move together and the offset is kept.

   The floor is one pixel per frame and it is a hard one. Each row is
   composited for its running transform, and a composited layer carrying text
   is snapped to whole pixels so the glyphs stay crisp; under a pixel per frame
   the snap becomes the motion — the row holds for two frames and jumps a pixel
   on the third, which looks like a marquee stuttering rather than one moving
   slowly. Nothing is being dropped when that happens. The animation is running
   perfectly at a speed the display cannot express.

   21s and 24s are the slowest laps that clear that floor at every width this
   stage runs at, measured rather than derived — a card is
   clamp(264px, 21vw, 344px), so one lap is 1450px at the 901px breakpoint,
   1626px at 1440 and 1850px once the cards hit their ceiling. The slower row
   decides it, and it holds at 1.01 px/frame from 901 through 1280, 1.13 at
   1440 and 1.28 from 1680 up.

   If this ever wants to feel slower, that is the wall it runs into: the pace
   is bounded by the pixel grid, not by taste.
   ============================================================ */

/* Alternating indices, so quote lengths stay even between the two rows. */
const ROWS = [
  {
    id: 'a',
    items: TESTIMONIALS.filter((_, i) => i % 2 === 0),
    direction: 'left',
    lap: 21,
  },
  {
    id: 'b',
    items: TESTIMONIALS.filter((_, i) => i % 2 === 1),
    direction: 'right',
    lap: 24,
  },
]

/* The brake, and the release. Asymmetric on purpose: coming to a stop should
   feel like the row noticing the cursor, and starting again should not feel
   like it was waiting to be let go. */
const BRAKE = { duration: 0.8, ease: 'power2.out' }
const RELEASE = { duration: 1.3, ease: 'power2.inOut' }

function Row({ row }) {
  return (
    <div
      className="t-row__track"
      data-track
      data-direction={row.direction}
      data-lap={row.lap}
    >
      {/* Two identical groups, and one lap travels exactly one group's width.
          The copy is scenery — the quotes are already in the document once,
          and announcing all of them twice is the whole reason this pattern has
          a bad reputation with screen readers. */}
      {[0, 1].map((copy) => (
        <div
          className="t-row__group"
          key={copy}
          aria-hidden={copy === 1 ? 'true' : undefined}
        >
          {row.items.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      ))}
    </div>
  )
}

function TestimonialsSection() {
  const rootRef = useRef(null)
  /* The two running tweens, by row index, so the pointer handlers can reach
     the one they are over. Empty outside MARQUEE_OK, which is what makes those
     handlers no-ops on the static layout rather than something that has to be
     conditionally attached. */
  const loopsRef = useRef([])

  useGSAP(
    () => {
      const root = rootRef.current
      const q = gsap.utils.selector(rootRef)
      const mm = gsap.matchMedia()

      mm.add(MARQUEE_OK, () => {
        const tracks = q('[data-track]')
        const wall = q('[data-wall]')[0]
        /* Both the ground and the edge veil above the wall. They are the same
           photograph at the same framing, so they have to move as one — a
           scrub that scaled only the one behind the cards would slide the veil
           out of register with it and show the seam. */
        const plate = q('[data-plate]')

        /* xPercent rather than x: the track holds the list twice, so half of
           its own width is exactly one lap however many quotes are in the data
           and however wide they set. Nothing here is measured, which also means
           nothing here needs re-measuring on resize. */
        const loops = tracks.map((track) => {
          const back = track.dataset.direction === 'right'
          return gsap.fromTo(
            track,
            { xPercent: back ? -50 : 0 },
            {
              xPercent: back ? 0 : -50,
              duration: Number(track.dataset.lap),
              ease: 'none',
              repeat: -1,
            },
          )
        })
        loopsRef.current = loops

        /* Parked until the section is on screen. Without this, two twenty-card
           transform animations run on the compositor while the visitor is
           still reading the hero four sections up, and carry on after they have
           scrolled past. It matters more here than it did for a column: a row
           is several screens wide where a column was a screen and a half tall,
           so the layers being kept warm are correspondingly larger.

           Pausing preserves position, so the wall is exactly where it was left
           when it comes back into view. */
        loops.forEach((loop) => loop.pause())
        const gate = ScrollTrigger.create({
          trigger: root,
          /* Armed early and released late, so the rows are already at speed by
             the time any of the wall is actually readable. */
          start: 'top bottom+=25%',
          end: 'bottom top-=25%',
          onToggle: (self) =>
            loops.forEach((loop) => (self.isActive ? loop.play() : loop.pause())),
        })
        if (gate.isActive) loops.forEach((loop) => loop.play())

        /* The zoom into the wall, and it runs across the seam with the form
           above it: it starts the moment this section's top clears the bottom
           of the screen and finishes exactly as that top reaches the ceiling.
           So the whole move is spent on the boundary, and the transition out of
           Schedule the Installation *is* this animation. Nothing is pinned to
           buy the travel — the approach is already one viewport of scroll, so
           the move has the room without taking the scroll away from anyone.

           Two planes moving against each other rather than one moving alone.
           The wall comes up from under-size and grows into the frame while the
           ground settles back from over-size, so the rows approach as the
           photograph recedes and the section opens up rather than simply
           getting bigger. Both land on 1 at the same instant, which is the
           frame the wall takes the screen.

           The plate is only ever scaled above 1. It is the section's ground,
           and anything below 1 would part it from the edges and show the page
           behind — the wall can be under-size because it is an object standing
           on that ground, and the ground cannot.

           Scrubbed, because it is tied to the section's own travel and has to
           run backwards as readily as forwards. */
        const zoom = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'top top',
            scrub: 0.5,
          },
        })

        zoom
          .fromTo(wall, { scale: 0.86, opacity: 0.25 }, { scale: 1, opacity: 1 }, 0)
          .fromTo(plate, { scale: 1.12 }, { scale: 1 }, 0)

        return () => {
          gate.kill()
          zoom.scrollTrigger?.kill()
          zoom.kill()
          loops.forEach((loop) => loop.kill())
          loopsRef.current = []
          gsap.set(tracks, { clearProps: 'transform' })
          gsap.set([wall, ...plate], { clearProps: 'transform,opacity' })
        }
      })

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  /* Tweening timeScale rather than calling pause(). See BRAKE above. */
  const brake = (index) => {
    const loop = loopsRef.current[index]
    if (loop) gsap.to(loop, { timeScale: 0, ...BRAKE })
  }

  const release = (index) => {
    const loop = loopsRef.current[index]
    if (loop) gsap.to(loop, { timeScale: 1, ...RELEASE })
  }

  return (
    /* Labelled rather than headed. The section has no visible heading by
       design, and a region with no accessible name is one a screen reader can
       only describe as "section". */
    <section
      className="testimonials"
      id="testimonials"
      ref={rootRef}
      aria-label="What Solstice customers say"
    >
      {/* The ground. Decorative — an aerial of an array and the fields beside
          it says nothing the ten quotes do not, so it is not described. */}
      <div className="testimonials__plate" data-plate aria-hidden="true">
        <img
          className="testimonials__img"
          src={backgroundImg}
          alt=""
          loading="lazy"
        />
      </div>

      {/* The same photograph again, over the cards, showing only at the left
          and right edges. This is the fade the rows run out through, and it is
          here rather than as a mask on the wall for a performance reason: a
          masked ancestor takes its whole subtree off the compositor, so a mask
          on the wall would put both rows back on the main thread every frame.
          Masking a still image with nothing animating inside it costs nothing
          per frame, and what the eye gets is identical — the thing behind a
          fading card was always this photo. */}
      <div className="testimonials__edges" data-plate aria-hidden="true">
        <img
          className="testimonials__img"
          src={backgroundImg}
          alt=""
          loading="lazy"
        />
      </div>

      <div className="testimonials__wall" data-wall>
        {/* The brake is bound to the row, not to a card inside it. The gap
            between two cards is not a card, so a card-level handler goes false
            in every gap the pointer crosses — sweeping across the wall then
            stops and restarts the row several times a second, which is not a
            paused marquee but a stuttering one. The row is continuous for its
            whole width: one engage on the way in, one release on the way out. */}
        {ROWS.map((row, index) => (
          <div
            className="t-row"
            key={row.id}
            onPointerEnter={() => brake(index)}
            onPointerLeave={() => release(index)}
          >
            <Row row={row} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
