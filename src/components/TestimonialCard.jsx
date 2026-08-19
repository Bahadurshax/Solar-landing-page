/* One quote.

   The card is the hover target inside a band that brakes under the pointer,
   so it carries a state of its own. Without one the row slows with no
   acknowledgement of the cursor, which reads as the animation having broken
   rather than having been caught.

   Nothing else is in here. No portrait, no rating, no logo, no quotation
   glyph: at this size the sentence is the design, and every ornament added
   next to it is one more thing going past at the same speed. */

function TestimonialCard({ item }) {
  return (
    <figure className="t-card">
      <blockquote className="t-card__quote">{item.quote}</blockquote>

      <figcaption className="t-card__who">
        <span className="t-card__name">{item.name}</span>
        {/* One separator on the line. A metadata strip chained together with
            middle dots turns three real facts into decoration. */}
        <span className="t-card__meta">
          {item.place}
          <span className="t-card__dot" aria-hidden="true">
            ·
          </span>
          {item.system} since {item.year}
        </span>
      </figcaption>
    </figure>
  )
}

export default TestimonialCard
