# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The page is written for a homeowner in one of the districts of Karakalpakstan,
Uzbekistan — Nukus, Muynak, Kungrad, Chimboy and the surrounding oasis towns —
who pays an electricity bill they consider unpredictable and is evaluating
whether a rooftop solar installation is worth the commitment.

Two arrival states matter and they want opposite things:

- **The sceptic**, who has never heard of the company and treats a "$0 bills for
  seven years" claim as too good to be true. They need proof, terms, and a
  reason to believe the guarantee is enforceable.
- **The referred visitor**, who already heard about the company from a neighbour
  and arrives wanting a phone number in three seconds. The site's own
  testimonials are written around this person; they are the likelier converter
  and the page currently serves them worst.

## Product Purpose

A single-page marketing site for Solstice Energy, a residential solar installer.
Success is the visitor making contact — not reading the page, not reaching the
footer. Everything on the page exists to move a homeowner from "this sounds
implausible" to placing a call.

## Positioning

The claim a neighbouring installer could not truthfully copy is the guarantee
stated as a contract rather than a marketing promise: no electricity bill for
seven years, and if the bill is not zero across that period, Solstice pays the
difference, written into every install they sign.

Supporting mechanisms: a "Smart Controller" that manages output across seasons
and weather, crews recruited from the districts they wire (so service is an hour
away, not a region away), and hardware specified for the local climate — dust
storms, 45°C summers, hard winters — serviced twice a year.

## Operating Context

The visitor is a homeowner, not a specifier. They are comparing a large one-off
outlay against a recurring bill, and the decision is a household one made over
days, not a purchase made in a session. A substantial share arrive by
word-of-mouth from a neighbour who already has an installation.

The company has been fitting solar in Karakalpakstan since 2019
(`AboutSection.jsx`).

## Capabilities and Constraints

- **The site has no backend and will not get one.** Confirmed 2026-08-16. There
  is no form submission, no CRM, no email intake. The conversion action is a
  telephone call, and the design must treat a phone number as the primary
  affordance rather than as a fallback beneath a form.
- Existing stack is React + Vite, with GSAP/ScrollTrigger and Motion driving the
  scroll choreography. Four sections use scroll-pinned sequences.
- **Language: English only, deliberately.** Confirmed 2026-08-16. The audience's
  working languages are Karakalpak and Russian; English is an accepted property
  of this build and localization is out of scope. Do not raise it as a defect.
- Savings figures are currently denominated in USD while the audience is billed
  in som. Unresolved, and low priority given the content status below.

## Brand Commitments

- Name: Solstice Energy. Wordmark set in Unbounded; body copy in Albert Sans.
- Two brand marks currently coexist: a `lucide` bolt glyph in the header and a
  hand-drawn eight-ray sun (`SolsticeMark`) in the footer. The sun is the
  authored mark and is drawn at the wordmark's cap height on purpose; the bolt
  is a library default. Not yet reconciled.
- Voice, as established in the existing copy and worth preserving: plain,
  concrete, unornamented. Specific events over superlatives. The testimonial
  data file argues this explicitly — "nobody in a real kitchen talks that way,
  and a wall of superlatives read at speed turns into wallpaper."

## Evidence on Hand

**All content on this page is invented.** Confirmed by the project owner
2026-08-16. This is a portfolio / demonstration build, not a live business site.

Specifically fictional, and freely rewritable by future work:

- The company itself, its founding date, and the `contact@solstice.energy` /
  `+998 (61) 224-8372` contact details.
- All six case studies in `src/data/cases.js` — family names, system sizes and
  savings figures.
- All ten testimonials in `src/data/testimonials.js`.
- Every figure in the stats bar, including "5,200+ homes powered" and
  "18.7M+ kg CO₂ avoided". These are not sourced and do not need to reconcile
  with the 2019 founding date.
- The seven-year guarantee and its terms.

Genuinely real, and worth preserving:

- The districts and their coordinates. `src/data/region-map.js` fits two real
  anchor points and projects true lat/lon, so the six pins sit at their actual
  geographic positions. This is the one factual layer in the page.

Because the content is fiction, future work must not present any figure here as
sourced, cite it as evidence, or add claims that imply verification.

## Product Principles

1. **The call is the conversion.** With no backend, every persuasive investment
   must terminate in a reachable phone number. A section that raises conviction
   without offering a way to act is unfinished.
2. **Serve the referred visitor first.** The sceptic needs the full argument;
   the neighbour's referral needs a number immediately. The page currently
   builds only the first path and must stop making the second one scroll.
3. **The guarantee is the product.** It is the only claim a competitor cannot
   copy, and it earns the page's strongest placement and its clearest proof.
4. **Specific over superlative.** One concrete event outperforms a wall of
   adjectives. This governs copy, testimonials, and stat presentation alike.
5. **Motion must argue, not decorate.** The existing About section sets the
   standard: it keeps its light cycle on narrow screens precisely because the
   passing day is the argument. Effects that would be cut at a breakpoint
   without loss are decoration and should be treated as such.

## Accessibility & Inclusion

No product-specific standard was established. General practice applies; note
that the existing build's reduced-motion handling is unusually thorough and
should be preserved as work continues.
