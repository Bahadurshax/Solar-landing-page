/* The suppliers, as one band that drifts.

   The section is a marquee, which is a form with a real objection against it:
   a band that moves on its own asks for attention it has not earned, and half
   its content is off screen at any moment. Three things answer that objection
   rather than ignoring it.

   It brakes. The band does not stop dead under the cursor, it decelerates over
   most of a second and accelerates back when the cursor leaves, so stopping to
   read a name is a gesture the band answers rather than a switch it flips.

   It only moves where stopping it is possible. A marquee whose defence is
   "the reader can pause it" has no defence on a touch screen, so a coarse
   pointer gets the static list. So does a narrow viewport, and so does anyone
   who has asked for less motion. See MARQUEE_OK in breakpoints.js.

   It stops when nobody is looking. The tween is paused while the section is
   off screen, which on a page that already runs three pinned timelines is the
   difference between a decoration and a tax. */

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { MARQUEE_OK } from '../breakpoints.js'
import { PARTNERS } from '../data/partners.js'
import '../styles/partners.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* One lap of the band. Slow enough that a name is readable in passing without
   the reader having to catch it, which is the number this whole component is
   really tuned on. */
const LAP_SECONDS = 46

/* The brake, and the release. Asymmetric on purpose: coming to a stop should
   feel like the band noticing the cursor, and starting again should not feel
   like it was waiting to be let go. `power2.out` decelerates hardest at the
   beginning of the stop, which is where the eye reads the intent. */
const BRAKE = { duration: 0.9, ease: 'power2.out' }
const RELEASE = { duration: 1.4, ease: 'power2.inOut' }

function Row({ hidden }) {
  return (
    <div className="partners__set" aria-hidden={hidden || undefined}>
      {PARTNERS.map(({ name, initials }) => (
        <span className="partners__item" key={name}>
          <span className="partners__mark" aria-hidden="true">
            {initials}
          </span>
          <span className="partners__name">{name}</span>
        </span>
      ))}
    </div>
  )
}

function PartnersDrift() {
  const rootRef = useRef(null)
  const trackRef = useRef(null)
  const loopRef = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MARQUEE_OK, () => {
        const track = trackRef.current
        if (!track) return

        /* xPercent rather than x: the track holds the list twice, so half of
           its own width is exactly one lap no matter how many partners are in
           the data or how wide their names set. Nothing here needs measuring,
           which also means nothing here needs remeasuring on resize. */
        const loop = gsap.to(track, {
          xPercent: -50,
          duration: LAP_SECONDS,
          ease: 'none',
          repeat: -1,
        })
        loopRef.current = loop

        const trigger = ScrollTrigger.create({
          trigger: rootRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        })

        /* Parked until the section is actually on screen. Without this the
           band runs from load for however long the rest of the page takes to
           read, and the visitor arrives at a lap it has already half finished. */
        loop.pause()
        if (trigger.isActive) loop.play()

        return () => {
          trigger.kill()
          loop.kill()
          loopRef.current = null
          gsap.set(track, { clearProps: 'transform' })
        }
      })

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  /* The brake itself. Tweening timeScale rather than calling pause() is the
     whole point of the request: pause() stops the band on the frame it is
     given, which reads as a fault. This bleeds the speed off. */
  const brake = () => {
    const loop = loopRef.current
    if (loop) gsap.to(loop, { timeScale: 0, ...BRAKE })
  }

  const release = () => {
    const loop = loopRef.current
    if (loop) gsap.to(loop, { timeScale: 1, ...RELEASE })
  }

  return (
    <section
      className="partners"
      id="partners"
      ref={rootRef}
      aria-labelledby="partners-title"
    >
      <div className="partners__head">
        <h2 className="partners__title" id="partners-title">
          Chosen, not sponsored
        </h2>
        <p className="partners__lede">
          Nobody pays to be on this list. These are the parts we would put on
          our own roofs.
        </p>
      </div>

      {/* Focus brakes it as well as hover. The names are not links, so nothing
          inside the band takes focus itself; this is for anyone driving the
          page from the keyboard who has landed near it and wants it to hold
          still. */}
      <div
        className="partners__band"
        onMouseEnter={brake}
        onMouseLeave={release}
        onFocusCapture={brake}
        onBlurCapture={release}
      >
        <div className="partners__bleed">
          <div className="partners__track" ref={trackRef}>
            <Row />
            {/* The second copy is the loop. Hidden from screen readers so the
                list is announced once rather than twice. */}
            <Row hidden />
          </div>
        </div>
      </div>
    </section>
  )
}

export default PartnersDrift
