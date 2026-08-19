import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MAP_H, MAP_W, project, routePath } from '../data/region-map.js'

const EASE = [0.16, 1, 0.3, 1]

/**
 * The dotted Karakalpakstan map, its routes and its pins.
 *
 * Three stacked layers: the bitmap, an SVG overlay in the image's own pixel
 * coordinates for the routes, and an HTML layer for the pins. Pins are HTML so
 * they can be real <button>s with focus rings and a tooltip, which SVG gives
 * none of for free. All three line up because the wrap is locked to the
 * image's aspect ratio, so a pin's percentage position and the SVG's user
 * units describe the same point.
 */
function RegionMap({ cases, activeCase, onSelect, reducedMotion }) {
  const routes = useMemo(() => {
    if (!activeCase) return []
    const from = project(activeCase.lon, activeCase.lat)
    return cases
      .filter((item) => item.id !== activeCase.id)
      .map((item) => ({
        id: item.id,
        d: routePath(from, project(item.lon, item.lat)),
      }))
  }, [cases, activeCase])

  return (
    <div className="region-map">
      <img
        className="region-map__image"
        src="/images/dotted-map.png"
        alt=""
        aria-hidden="true"
        draggable="false"
      />

      <svg
        className="region-map__overlay"
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        role="presentation"
        aria-hidden="true"
      >
        <AnimatePresence>
          {routes.map((route) => (
            <motion.path
              key={route.id}
              className="region-map__route"
              d={route.d}
              initial={reducedMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
              animate={reducedMotion ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.2 : 0.9, ease: EASE }}
            />
          ))}
        </AnimatePresence>
      </svg>

      <div className="region-map__pins">
        <AnimatePresence initial={false}>
          {cases.map((item) => {
            const { x, y } = project(item.lon, item.lat)
            const isActive = item.id === activeCase?.id

            return (
              <motion.div
                key={item.id}
                className="region-map__pin-slot"
                /* The half-size shift that centres the pin on its coordinate
                   has to be a motion transform, not a CSS one. Motion composes
                   the whole `transform` string from its own props and writes it
                   inline, so a `translate(-50%, -50%)` in the stylesheet is
                   silently dropped the moment the enter animation runs — and
                   every pin ends up offset down and to the right. */
                style={{
                  left: `${(x / MAP_W) * 100}%`,
                  top: `${(y / MAP_H) * 100}%`,
                  x: '-50%',
                  y: '-50%',
                }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.45, ease: EASE }}
              >
                <button
                  type="button"
                  className="region-map__pin"
                  data-active={isActive}
                  aria-pressed={isActive}
                  aria-label={`${item.location} — ${item.familyFull}, ${item.savings} saved`}
                  onClick={() => onSelect(item.id)}
                >
                  <span className="region-map__ring region-map__ring--outer" />
                  <span className="region-map__ring region-map__ring--mid" />
                  <span className="region-map__dot" />
                </button>

                <span className="region-map__tooltip" role="presentation">
                  <span className="region-map__tooltip-place">{item.place}</span>
                  <span className="region-map__tooltip-meta">
                    {item.systemSize} · {item.savings}
                  </span>
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default RegionMap
