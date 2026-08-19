import { motion } from 'motion/react'
import { Activity, Home, Leaf, ShieldCheck } from 'lucide-react'
import { STATS } from '../data/cases.js'

const EASE = [0.16, 1, 0.3, 1]

const ICONS = {
  home: Home,
  leaf: Leaf,
  shield: ShieldCheck,
  activity: Activity,
}

/* A description list, with the label as the term and the figure as its
   description — "5,200+" means nothing without "Homes powered". The figure
   still reads first: grid places it on the upper row. */
function StatsBar({ reducedMotion }) {
  return (
    <motion.dl
      className="stats-bar"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: reducedMotion ? 0.01 : 0.7,
        delay: reducedMotion ? 0 : 0.5,
        ease: EASE,
      }}
    >
      {STATS.map((stat) => {
        const Icon = ICONS[stat.icon]

        return (
          <div className="stats-bar__item" key={stat.label}>
            <Icon
              className="stats-bar__icon"
              size={18}
              strokeWidth={1.4}
              aria-hidden="true"
            />
            <dt className="stats-bar__label">{stat.label}</dt>
            <dd className="stats-bar__value">{stat.value}</dd>
          </div>
        )
      })}
    </motion.dl>
  )
}

export default StatsBar
