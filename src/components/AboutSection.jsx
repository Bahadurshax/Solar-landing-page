import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import AboutPanel from './AboutPanel.jsx'
import { ABOUT_PANELS } from '../data/about.js'
import { NARROW_STAGE, NO_MOTION, WIDE_STAGE } from '../breakpoints.js'
import '../styles/about.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function AboutSection() {
  const rootRef = useRef(null)
  const pinRef = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(rootRef)
      const root = rootRef.current
      const track = q('[data-track]')[0]
      const panels = q('[data-panel]')
      const images = q('[data-panel-image]')
      const numbers = q('[data-panel-number]')
      const lines = q('[data-panel-line]')
      const statementLines = q('[data-statement-line]')
      const lede = q('[data-lede]')[0]

      const mm = gsap.matchMedia()

      /* ============ Desktop: the pinned day ============ */
      mm.add(
        WIDE_STAGE,
        () => {
          /* Measured live rather than captured. The track is sized in vw, so
             every one of these changes on resize, and invalidateOnRefresh is
             what makes the functions get asked again. */
          const distance = () => Math.max(1, track.scrollWidth - window.innerWidth)
          /* The pan is stretched past its own width so the scroll does not
             sprint through four slides. Below about 1.2 the panels flick by
             faster than their titles can finish arriving. */
          const length = () => distance() * 1.35

          /* How long the section is held on screen after the pan has finished,
             and it is exactly one viewport for a reason: it is the distance the
             quote band has to travel to go from resting below the fold to
             filling the frame. Held for less and the band would still be
             arriving when the section let go; held for more and it would sit
             finished against a section that had not yet released. */
          const cover = () => pinRef.current.offsetHeight

          /* Handed to the stylesheet, because the other half of this effect is
             a negative margin on a section this component does not own. The
             band is pulled up by the same distance the pin holds for, so the
             scroll that holds the section is the same scroll that carries the
             band over it — rather than the two happening one after the other,
             which is just the page scrolling normally.

             Published as a measured pixel value rather than left as `100dvh`
             in the stylesheet so the two cannot disagree. The pinned element is
             a viewport tall but it also carries a `min-height`, and on a short
             window that floor is what actually decides its height. */
          const publishCover = () =>
            document.documentElement.style.setProperty(
              '--about-cover',
              `${cover()}px`,
            )

          gsap.set(statementLines, { yPercent: 108 })
          gsap.set(lede, { opacity: 0, y: 18 })
          gsap.set(panels, { scale: 0.9, yPercent: 4 })
          gsap.set(images, { scale: 1.16 })

          /* --- the pan, and the hold after it ---

             One timeline of two children, and the reason it is a timeline
             rather than the single tween it used to be is the second one. The
             section now stays pinned past the end of its own movement, so the
             quote band can climb over a section that is standing still. That
             hold is scroll distance during which nothing here animates, and an
             empty tween is the honest way to spend it: the pin lasts as long as
             the timeline, so the timeline has to be as long as the pin.

             Every panel below rides this as a containerAnimation. That mapping
             reads positions by seeking, so the trailing hold costs it nothing —
             seek anywhere in that stretch and the track is exactly where the
             pan left it. */
          const pan = gsap.timeline({
            paused: true,
            defaults: { ease: 'none' },
          })

          pan.to(track, { x: () => -distance(), duration: 1 }, 0)
          pan.to({}, { duration: 1 }, 1)

          const [move, hold] = pan.getChildren()

          /* Durations in scroll pixels, so the two segments hold their share of
             the range whatever the window is doing. GSAP will not take a
             function for a duration the way it will for a value, so they are
             set here and set again on every refresh. */
          const retime = () => {
            move.duration(length())
            hold.duration(cover())
          }

          retime()
          publishCover()

          ScrollTrigger.create({
            animation: pan,
            trigger: root,
            start: 'top top',
            end: () => `+=${length() + cover()}`,
            pin: pinRef.current,
            /* Kept low. Child triggers read their position from this timeline's
               progress, so a long smoothing tail shows up as the titles
               arriving slightly after the panel they belong to. */
            scrub: 0.4,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            /* The arc is measured in live viewport pixels, so both the cached
               tween values and the segment durations have to be rebuilt
               whenever the trigger remeasures. */
            onRefresh: () => {
              retime()
              publishCover()
            },
          })

          /* --- the statement, on arrival --- */
          const intro = gsap.timeline({
            scrollTrigger: { trigger: root, start: 'top 70%', once: true },
          })

          intro
            .to(statementLines, {
              yPercent: 0,
              duration: 1,
              ease: 'expo.out',
              stagger: 0.09,
            })
            .to(lede, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.3)

          /* --- per panel, keyed to its own position in the pan ---
             containerAnimation is what lets a trigger measure a panel's
             horizontal travel instead of the page's vertical scroll. Without
             it every panel fires at once the moment the section pins, because
             vertically none of them ever move. */
          panels.forEach((panel, i) => {
            const settle = {
              trigger: panel,
              containerAnimation: pan,
              start: 'left 92%',
              end: 'center 58%',
              scrub: true,
            }

            /* The dolly. The panel grows and rises as it comes to the middle
               of the frame, so the pan reads as a camera moving along a row
               rather than as a strip sliding past a window. */
            gsap.to(panel, {
              scale: 1,
              yPercent: 0,
              ease: 'power2.out',
              scrollTrigger: settle,
            })

            /* The photograph settles out of its own overscan on the same beat.
               Two zooms at once, the panel's and the image's, is what gives
               the arrival its depth. */
            gsap.to(images[i], {
              scale: 1,
              ease: 'power2.out',
              scrollTrigger: settle,
            })

            /* Counter-travel, at a fraction of the pan. The image drifts back
               against the direction of movement and the ordinal drifts with
               it, so the panel has three planes in it. */
            gsap.fromTo(
              images[i],
              { xPercent: -6 },
              {
                xPercent: 6,
                ease: 'none',
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: pan,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                },
              },
            )

            gsap.fromTo(
              numbers[i],
              { x: 26 },
              {
                x: -26,
                ease: 'none',
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: pan,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                },
              },
            )

            /* Titles are not scrubbed. A title that tracks the scroll wheel
               can be dragged half-revealed and left there, and a headline
               frozen mid-rise reads as a rendering fault. It plays once, at
               its own speed, when the panel reaches the frame.

               fromTo, and the hidden state is not set anywhere else. A plain
               `to` off a separate gsap.set left every title clipped and
               unrevealed: the tween had no recorded start of its own, and the
               panels begin the pan already past this trigger's start, so the
               play it depends on had nothing to play from. */
            gsap.fromTo(
              panel.querySelectorAll('[data-panel-line]'),
              { yPercent: 108 },
              {
                yPercent: 0,
                duration: 0.95,
                ease: 'expo.out',
                stagger: 0.08,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: pan,
                  start: 'left 78%',
                  once: true,
                },
              },
            )

            gsap.fromTo(
              panel.querySelector('[data-panel-text]'),
              { opacity: 0, y: 16 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                delay: 0.18,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: pan,
                  start: 'left 78%',
                  once: true,
                },
              },
            )
          })

          /* The overlap belongs to this branch and has to leave with it. Left
             behind on a resize down to the stacked layout, the quote band
             would keep its negative margin and climb over a section that was
             no longer being held anywhere. */
          return () =>
            document.documentElement.style.removeProperty('--about-cover')
        },
      )

      /* ============ Narrow, and reduced motion: the same day, stacked ============

         No pin, no pan, no sun. The light still travels, because it is the
         section's argument and not its decoration, but it is driven by the
         page's own vertical scroll across the stack instead. */
      mm.add(NARROW_STAGE, () => {
        const reduce = window.matchMedia(NO_MOTION).matches

        gsap.set([lines, statementLines], { yPercent: 0, clearProps: 'transform' })
        gsap.set(lede, { opacity: 1, y: 0 })
        gsap.set([panels, images], { clearProps: 'all' })
        gsap.set(track, { clearProps: 'transform' })

        if (reduce) return

        panels.forEach((panel) => {
          gsap.from(panel, {
            y: 48,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: panel, start: 'top 85%', once: true },
          })
        })
      })

      /* The remeasure that used to be scheduled here lives in App now, for the
         reason given in HowItWorks: `ScrollTrigger.refresh()` is global, and
         four copies of it recalculated every trigger on the page four times
         over. This section still depends on it — it pins, and it computes its
         scroll length from the track's width, so a stale measurement is a pan
         that stops early or runs past its end — it just no longer asks for it
         separately. */

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  return (
    <section className="about" id="about" ref={rootRef} aria-labelledby="about-title">
      <div className="about__viewport" ref={pinRef}>
        <div className="about__track" data-track>
          {/* The statement is the first slide rather than a header above the
              track. As a header it would sit still while the section moved
              underneath it, which puts the one piece of copy that sets up the
              other three outside the sequence it sets up. */}
          <div className="about__statement" data-slide>
            <h2 className="about__heading" id="about-title">
              {['We started with', 'one roof in Nukus.'].map((line) => (
                <span className="about__heading-line" key={line}>
                  <span data-statement-line>{line}</span>
                </span>
              ))}
            </h2>
            <p className="about__lede" data-lede>
              Solstice has been fitting solar in Karakalpakstan since 2019. The
              crews, the servicing and the guarantee are all ours, and none of
              it is subcontracted.
            </p>
          </div>

          {ABOUT_PANELS.map((panel, i) => (
            <AboutPanel key={panel.id} panel={panel} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutSection
