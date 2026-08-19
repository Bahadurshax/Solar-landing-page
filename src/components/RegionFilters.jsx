import { motion } from 'motion/react'
import { REGIONS } from '../data/cases.js'

const EASE = [0.16, 1, 0.3, 1]

function RegionFilters({ active, onChange, reducedMotion }) {
  return (
    <div
      className="region-filters"
      role="group"
      aria-label="Filter case studies by region"
    >
      {REGIONS.map((region, i) => (
        <motion.button
          key={region.id}
          type="button"
          className="region-filters__pill"
          data-active={region.id === active}
          aria-pressed={region.id === active}
          onClick={() => onChange(region.id)}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: reducedMotion ? 0.01 : 0.6,
            delay: reducedMotion ? 0 : 0.12 + i * 0.07,
            ease: EASE,
          }}
        >
          {region.label}
        </motion.button>
      ))}
    </div>
  )
}

export default RegionFilters
