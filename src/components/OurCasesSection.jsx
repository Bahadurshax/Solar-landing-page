import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import RegionFilters from './RegionFilters.jsx'
import RegionMap from './RegionMap.jsx'
import FeaturedCaseCard from './FeaturedCaseCard.jsx'
import CasesCarousel from './CasesCarousel.jsx'
import StatsBar from './StatsBar.jsx'
import { CASES, DEFAULT_CASE_ID } from '../data/cases.js'
import '../styles/our-cases.css'

const EASE = [0.16, 1, 0.3, 1]

function OurCasesSection() {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef(null)
  const [region, setRegion] = useState('all')
  const [activeId, setActiveId] = useState(DEFAULT_CASE_ID)

  /* Whether the section is worth animating. The active map pin pulses on an
     `infinite` loop, and off screen that is a compositor layer kept awake for
     the whole session to draw something nobody is looking at.

     Written to the DOM rather than to state, deliberately: the answer is only
     ever read by a stylesheet, and routing it through React would re-render the
     map, the carousel and fourteen cards twice per crossing to set one
     attribute. The margin is generous because the gate should open before the
     section arrives, not as it lands — a pin that starts pulsing mid-entrance
     reads as a glitch. Same pattern as the testimonial marquee. */
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) root.dataset.onscreen = ''
        else delete root.dataset.onscreen
      },
      { rootMargin: '25% 0px' },
    )

    io.observe(root)
    return () => io.disconnect()
  }, [])

  const visible = useMemo(
    () =>
      region === 'all'
        ? CASES
        : CASES.filter((item) => item.region === region),
    [region],
  )

  /* Filtering to a region that excludes the featured case would otherwise
     leave the card showing a home with no pin on the map. The first case of
     the new region takes over instead. */
  const activeCase =
    visible.find((item) => item.id === activeId) ?? visible[0] ?? CASES[0]

  const handleRegionChange = (next) => {
    setRegion(next)
    const stillVisible =
      next === 'all' || CASES.some((c) => c.id === activeId && c.region === next)
    if (!stillVisible) {
      const first = CASES.find((c) => c.region === next)
      if (first) setActiveId(first.id)
    }
  }

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: {
      duration: reducedMotion ? 0.01 : 0.85,
      delay: reducedMotion ? 0 : delay,
      ease: EASE,
    },
  })

  return (
    <section className="our-cases" ref={rootRef} aria-labelledby="our-cases-title">
      <div className="our-cases__inner">
        <div className="our-cases__top">
          <motion.div className="our-cases__intro" {...rise()}>
            <h2 className="our-cases__heading" id="our-cases-title">
             Solar Success Stories
            </h2>
            <p className="our-cases__lede">
              Real homes. Real results. Explore how families across
              Karakalpakstan are saving with clean, independent energy.
            </p>
          </motion.div>

          <RegionFilters
            active={region}
            onChange={handleRegionChange}
            reducedMotion={reducedMotion}
          />
        </div>

        <div className="our-cases__stage">
          <motion.div
            className="our-cases__map"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: reducedMotion ? 0.01 : 1.1,
              delay: reducedMotion ? 0 : 0.15,
              ease: EASE,
            }}
          >
            <RegionMap
              cases={visible}
              activeCase={activeCase}
              onSelect={setActiveId}
              reducedMotion={reducedMotion}
            />
          </motion.div>

          {/* Two elements, deliberately. The outer one owns the absolute
              placement and the vertical centring transform; the inner one owns
              the entrance animation. Combined, motion's inline transform would
              overwrite the centring and drop the card half its own height. */}
          <div className="our-cases__featured">
            <motion.div {...rise(0.3)}>
              <FeaturedCaseCard item={activeCase} reducedMotion={reducedMotion} />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="our-cases__carousel"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: reducedMotion ? 0.01 : 0.8,
            delay: reducedMotion ? 0 : 0.4,
            ease: EASE,
          }}
        >
          <CasesCarousel
            cases={visible}
            activeId={activeCase.id}
            onSelect={setActiveId}
            reducedMotion={reducedMotion}
          />
        </motion.div>

        <StatsBar reducedMotion={reducedMotion} />
      </div>

      {/* Pin and card clicks change content elsewhere on the page; without this
          a screen-reader user gets no confirmation that anything happened. */}
      <p className="our-cases__announcer" role="status" aria-live="polite">
        {`Now featuring ${activeCase.familyFull}, ${activeCase.location}.`}
      </p>
    </section>
  )
}

export default OurCasesSection
