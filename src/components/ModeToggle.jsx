import { motion } from 'motion/react'

const OPTIONS = [
  { id: 'morning', label: 'Morning' },
  { id: 'night', label: 'Night' },
]

/* Damping ratio, for the two springs below: `damping / (2 * sqrt(stiffness *
   mass))`. Below 1 the spring overshoots and comes back, and how far below
   sets how much. It is worth stating because both numbers here were picked
   from a target overshoot rather than by feel, and neither survives one of the
   three values being nudged on its own. */

/* Ratio 0.70, which overshoots by about 5% and settles in a quarter second.
   The travel was previously at 0.90 — near critical damping, so the indicator
   slid between the halves and stopped dead without ever passing its mark.
   Stiffer as well as looser: at the old 260 a bounce this size would have
   floated, and a segmented control should feel like a switch being thrown. */
const TRAVEL_SPRING = { type: 'spring', stiffness: 420, damping: 27, mass: 0.9 }

/* Ratio 0.59, so this one visibly rebounds. It is the smaller of the two
   movements and it is over faster, so it can be bouncier than the travel
   without the pair reading as loose. */
const SQUASH_SPRING = { type: 'spring', stiffness: 500, damping: 22, mass: 0.7 }

function ModeToggle({ mode, onChange, locked, reducedMotion }) {
  const indicatorTransition = reducedMotion ? { duration: 0.2 } : TRAVEL_SPRING

  return (
    <motion.div
      className="toggle"
      role="group"
      aria-label="Choose lighting mode"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {OPTIONS.map((option) => {
        const active = mode === option.id
        return (
          <button
            key={option.id}
            type="button"
            className={`toggle__option${active ? ' toggle__option--active' : ''}`}
            aria-pressed={active}
            disabled={locked && !active}
            onClick={() => onChange(option.id)}
          >
            {active && (
              <motion.span
                layoutId="toggle-indicator"
                className="toggle__indicator"
                transition={indicatorTransition}
              >
                {/* Stretched along the direction of travel and thinned across
                    it, then sprung back. The indicator is remounted into the
                    other button on every change, so `initial` is the start of
                    each throw rather than a one-off on page load.

                    Both halves of the toggle are the same size, so the layout
                    animation above only ever moves this box and never resizes
                    it. That is what makes it safe to scale the fill inside:
                    there is no projection distortion for it to compound. */}
                <motion.span
                  className="toggle__indicator-fill"
                  initial={reducedMotion ? false : { scaleX: 1.06, scaleY: 0.96 }}
                  animate={{ scaleX: 1, scaleY: 1 }}
                  transition={reducedMotion ? { duration: 0 } : SQUASH_SPRING}
                />
              </motion.span>
            )}
            <span className="toggle__labels">
              <span className="toggle__label">{option.label}</span>
              <span className="toggle__sub">$0 for Electricity</span>
            </span>
          </button>
        )
      })}
    </motion.div>
  )
}

export default ModeToggle
