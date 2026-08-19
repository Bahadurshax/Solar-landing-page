import { motion } from 'motion/react'

function HeroHeadline() {
  return (
    <motion.h1
      className="headline"
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* The setup is quiet and the payoff carries the ink, which is what the
          two weights are for. It stays a number rather than a superlative:
          "seven years" is checkable and "the last bill you will ever pay" is
          not, and the page's whole argument is that a specific fact beats a
          claim. Two lines, both inside twenty characters, because the display
          clamp runs to 93px against a 920px measure and a third line would
          drop the second one into the roof before the scroll ever starts. */}
      <span className="headline__line">
        <span className="headline__soft">Seven years of</span>
      </span>
      <span className="headline__line">
        <span className="headline__strong">zero bills.</span>
      </span>
    </motion.h1>
  )
}

export default HeroHeadline
