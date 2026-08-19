/* Presentational only. Every transform on this markup is written by the
   section's GSAP timeline, so there is no motion library in here and no state:
   two animation engines writing the same element's transform is the one way
   this section can visibly tear. The `data-` hooks below are the contract with
   AboutSection. */
function AboutPanel({ panel, index }) {
  /* The first panel is not lazy. The track is laid out horizontally and starts
     with the statement, so panel one is already inside the frame at rest on a
     wide screen — before any scroll, and while the section is pinned it is the
     largest image on screen. Marking it lazy put the section's own LCP
     candidate behind a load-time heuristic for no gain; the two panels behind
     it are genuinely off to the right and keep the attribute. */
  const eager = index === 0

  return (
    <article className="about-panel" data-slide data-panel>
      <div className="about-panel__media">
        <img
          className="about-panel__image"
          data-panel-image
          src={panel.image}
          alt={panel.alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
        />
        <span className="about-panel__scrim" aria-hidden="true" />
      </div>

      <div className="about-panel__body">
        <div className="about-panel__copy">
          <h3 className="about-panel__title">
            {panel.titleLines.map((line) => (
              /* Two elements per line: the outer one clips, the inner one is
                 what travels. A single element cannot both hide the overflow
                 and be the thing overflowing. */
              <span className="about-panel__title-line" key={line}>
                <span data-panel-line>{line}</span>
              </span>
            ))}
          </h3>
          <p className="about-panel__text" data-panel-text>
            {panel.body}
          </p>
        </div>

        <span className="about-panel__number" data-panel-number aria-hidden="true">
          {panel.number}
        </span>
      </div>
    </article>
  )
}

export default AboutPanel
