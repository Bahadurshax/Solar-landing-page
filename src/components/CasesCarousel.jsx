import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CountryFlag from './CountryFlag.jsx'

const EASE = [0.16, 1, 0.3, 1]

function CasesCarousel({ cases, activeId, onSelect, reducedMotion }) {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  /* Measured rather than assumed. Card width comes from CSS and changes at two
     breakpoints, and the number of cards changes with the region filter — so
     how far the track *can* travel is only knowable from the DOM. It also
     decides whether the arrows are live at all: with four cards on a wide
     screen there is no overflow, and arrows that visibly do nothing are worse
     than arrows that are honestly disabled. */
  const [metrics, setMetrics] = useState({ step: 0, maxShift: 0 })

  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const measure = () => {
      const first = track.firstElementChild
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      const step = first ? first.getBoundingClientRect().width + gap : 0
      const maxShift = Math.max(0, track.scrollWidth - viewport.clientWidth)
      setMetrics({ step, maxShift })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(track)
    return () => observer.disconnect()
  }, [cases])

  const maxIndex =
    metrics.step > 0 ? Math.ceil(metrics.maxShift / metrics.step) : 0

  /* Clamped on the way out rather than corrected in an effect. Filtering to a
     smaller region shrinks the track, which can strand the stored index past
     the new end; resolving that during render means the arrows are never
     briefly wrong and no extra pass is scheduled. */
  const page = Math.min(index, maxIndex)

  const move = useCallback(
    (delta) => {
      setIndex(Math.min(Math.max(page + delta, 0), maxIndex))
    },
    [page, maxIndex],
  )

  const shift = Math.min(page * metrics.step, metrics.maxShift)

  return (
    <div className="cases-carousel">
      <button
        type="button"
        className="cases-carousel__arrow cases-carousel__arrow--prev"
        onClick={() => move(-1)}
        disabled={page === 0}
        aria-label="Show previous case studies"
      >
        <ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" />
      </button>

      <div className="cases-carousel__viewport" ref={viewportRef}>
        <motion.ul
          className="cases-carousel__track"
          ref={trackRef}
          animate={{ x: -shift }}
          transition={{ duration: reducedMotion ? 0 : 0.65, ease: EASE }}
        >
          {cases.map((item) => {
            const isActive = item.id === activeId

            return (
              <motion.li
                key={item.id}
                className="cases-carousel__item"
                layout={!reducedMotion}
                transition={{ duration: reducedMotion ? 0 : 0.5, ease: EASE }}
              >
                <button
                  type="button"
                  className="case-card"
                  data-active={isActive}
                  aria-pressed={isActive}
                  onClick={() => onSelect(item.id)}
                >
                  <span className="case-card__thumb">
                    <img
                      src={item.image}
                      alt={item.alt}
                      style={{ objectPosition: item.imagePosition }}
                      loading="lazy"
                      draggable="false"
                    />
                  </span>

                  <span className="case-card__body">
                    <span className="case-card__place">
                      <CountryFlag />
                      {item.place}
                    </span>
                    <span className="case-card__family">{item.family}</span>

                    <span className="case-card__metrics">
                      <span className="case-card__metric">
                        {item.systemSize}
                      </span>
                      <span className="case-card__metric-divider" aria-hidden="true" />
                      <span className="case-card__metric case-card__metric--money">
                        {item.savings}
                      </span>
                    </span>

                    <span className="case-card__note">
                      {/* Doubles as the non-colour signal for the active state,
                          which is otherwise carried by a gold border alone. */}
                      {isActive ? 'Featured on map' : 'Saved over 7 years'}
                    </span>
                  </span>
                </button>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>

      <button
        type="button"
        className="cases-carousel__arrow cases-carousel__arrow--next"
        onClick={() => move(1)}
        disabled={page >= maxIndex}
        aria-label="Show more case studies"
      >
        <ChevronRight size={20} strokeWidth={1.6} aria-hidden="true" />
      </button>
    </div>
  )
}

export default CasesCarousel
