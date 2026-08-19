/* The four beats of the sequence, in the order the cards play them: capture,
   control, distribute, guarantee. The shorter version named only the first
   three and left the guarantee to a claims list that no longer exists. */
const DESCRIPTION =
  'Your system captures sunlight, controls every watt and distributes clean energy through the whole home, day and night, while protecting your electricity costs for the next seven years.'

/* One sentence, centred, at display size. The panel used to open with an
   eyebrow, a two-line heading and three claims stacked beside it; with those
   gone the sentence is the only thing above the cards, so it is set as the
   section's statement rather than as supporting copy. */
function EditorialPanel() {
  const words = DESCRIPTION.split(' ')

  return (
    <div className="editorial">
      <p className="editorial__description" data-description>
        {words.map((word, i) => (
          <span className="editorial__word" data-word key={`${word}-${i}`}>
            {i === words.length - 1 ? word : `${word} `}
          </span>
        ))}
      </p>
    </div>
  )
}

export default EditorialPanel
