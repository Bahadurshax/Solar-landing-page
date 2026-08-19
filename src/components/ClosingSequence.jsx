import TestimonialsSection from './TestimonialsSection.jsx'
import PartnersDrift from './PartnersDrift.jsx'
import SiteFooter from './SiteFooter.jsx'
import '../styles/closing.css'

/* ============================================================
   The close
   ============================================================

   The last three sections of the page, in order, and nothing else.

   This used to be a pinned stage: the testimonial wall was held at the top of
   one clipped screen while the footer came up from below the bottom edge and
   lifted the wall out of the way, so the footer read as arriving under its own
   power rather than as the next thing down a scroll. That is gone. The three
   sections now stack the way every other section on the page does, and the
   footer is reached by scrolling to it.

   What the removal bought is the slot between the wall and the footer. The
   stage was exactly one screen and the wall filled it, so there was no
   in-flow position after the testimonials for anything to occupy; the partners
   band is in that position now, which is the whole reason the push came out.

   The component stays rather than dissolving into App because `.closing` is
   still what sectionSnap.js looks for, and because the tail of the page is a
   real grouping even without a timeline holding it together. */

function ClosingSequence() {
  return (
    <div className="closing">
      <TestimonialsSection />
      <PartnersDrift />
      <SiteFooter />
    </div>
  )
}

export default ClosingSequence
