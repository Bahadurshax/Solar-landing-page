import { AnimatePresence, motion } from 'motion/react'
import { ShieldCheck } from 'lucide-react'
import CountryFlag from './CountryFlag.jsx'

const EASE = [0.16, 1, 0.3, 1]

/**
 * The focal card floating over the map.
 *
 * Selecting another case swaps the content rather than the card: the shell,
 * its border and its shadow stay mounted, and only the inside crossfades. That
 * keeps the card from flickering out of the composition on every click, and it
 * is why the copy column carries a min-height — quotes differ in length, and
 * without it the footer badge would jump between selections.
 */
function FeaturedCaseCard({ item, reducedMotion }) {
  const swap = reducedMotion
    ? { duration: 0.15 }
    : { duration: 0.4, ease: EASE }

  return (
    <motion.article
      className="featured-case"
      aria-label={`Featured case study: ${item.familyFull}, ${item.location}`}
      whileHover={reducedMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className="featured-case__body">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            className="featured-case__copy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={swap}
          >
            <div className="featured-case__place">
              <CountryFlag />
              <span className="featured-case__country">Karakalpakstan</span>
            </div>
            <span className="featured-case__region">{item.place}</span>

            <h3 className="featured-case__family">{item.familyFull}</h3>

            <div className="featured-case__stats">
              <div className="featured-case__stat">
                <span className="featured-case__stat-label">System Size</span>
                <span className="featured-case__stat-value">
                  {item.systemSize}
                </span>
              </div>
              <span className="featured-case__divider" aria-hidden="true" />
              <div className="featured-case__stat">
                <span className="featured-case__stat-label">
                  Est. Savings / 7 yrs
                </span>
                <span className="featured-case__stat-value">
                  {item.savings}
                </span>
              </div>
            </div>

            <blockquote className="featured-case__quote">
              {item.quote}
            </blockquote>
            <p className="featured-case__attribution">— {item.familyFull}</p>
          </motion.div>
        </AnimatePresence>

        <div className="featured-case__media">
          {/* The swap animates opacity only. The hover zoom is a CSS transform
              on this same element, and any transform in the swap would be
              written to the inline style, which a stylesheet rule can no
              longer beat. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={item.id}
              className="featured-case__image"
              src={item.image}
              alt={item.alt}
              style={{ objectPosition: item.imagePosition }}
              draggable="false"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={swap}
            />
          </AnimatePresence>
        </div>
      </div>

      <div className="featured-case__guarantee">
        <span className="featured-case__guarantee-left">
          <ShieldCheck size={16} strokeWidth={1.6} aria-hidden="true" />
          $0 bills for 7 years
        </span>
        <span className="featured-case__guarantee-right">Guaranteed</span>
      </div>
    </motion.article>
  )
}

export default FeaturedCaseCard
