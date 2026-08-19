import { useEffect, useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import '../styles/contact-dock.css'

/* ============================================================
   The dock — three ways to reach a person, always within reach
   ============================================================

   Everything the page offers as a way of getting in touch is at one end of it
   or the other: the navigation's Schedule Installation at the top, the form
   and the phone number after About, the contacts in the footer. In between —
   which is most of the page, and all of the part where the argument is
   actually being made — there is nothing. A visitor convinced by the fourth
   case study has to go looking for the thing they were just convinced to do.

   So three controls follow the scroll instead. Two are the messaging apps this
   audience actually uses, and one is the page's own conversion, which is what
   the pill is: the same target the navigation points at, kept at the bottom of
   the frame the whole way down.

   ------------------------------------------------------------

   Three rules about when it is not there, and all three are the same rule.

   It is UI laid over content, so it is only there when the content is not
   asking for the whole frame:

   - Not over the hero. That viewport is a photograph, a headline and one
     control, and it is the one composition on the page that was designed as a
     picture rather than as a page. The dock arrives once it has been left.
   - Not over the open film, which is a screen the visitor deliberately opened
     to fill the viewport. Chrome floating on top of it is exactly the thing
     that section is built to get rid of.
   - Not under the mobile menu, which is a full-screen panel with its own
     copies of these destinations in it.

   The last two are asked in the stylesheet rather than wired through here, and
   deliberately: both are somebody else's state — the film's data-expanded, the
   menu's presence in the DOM — and routing them through React would mean this
   component holding a copy of two things it does not own and cannot keep
   correct. A `:has()` in CSS reads the live DOM and cannot go stale. */

/* The one contact detail the project actually has. WhatsApp's own link format
   is the number with nothing but digits, which is what makes it derivable from
   the phone rather than a second thing to keep in step with it. */
const TEL = '998612248372'

/* PLACEHOLDER — no Telegram handle exists for this project yet, and a guessed
   one is worse than an obvious gap: t.me resolves unclaimed names to a dead
   page and claimed ones to a stranger. Replace before this ships. */
const TELEGRAM = 'https://t.me/REPLACE_WITH_REAL_HANDLE'

const WHATSAPP = `https://wa.me/${TEL}`

/* Drawn rather than pulled from the icon set, because the icon set does not
   have them: Lucide dropped its brand marks, and these two are the one place
   on the page where a recognisable shape matters more than a consistent stroke
   weight. Nobody reads a label under a messaging icon — they recognise the
   mark or they do not use it, and the mark includes its colour.

   Both are the official paths, filled rather than stroked, and both take their
   colour from the stylesheet through currentColor so the two brand hues are
   declared in one place next to everything else the dock is made of. */
function TelegramMark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

function WhatsAppMark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.8 11.8 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413" />
    </svg>
  )
}

function ContactDock() {
  /* Present is the safe failure. Where there is nothing to watch the hero
     with, a dock that is always there is a small imposition; one that never
     arrives is a page with no way to get in touch from the middle of it. */
  const [shown, setShown] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    /* Not defended against being absent. App renders the hero unconditionally
       as the first thing in the document — it is structure, not state, and a
       null check here would be guarding against a page that has already
       failed in a way this component cannot fix. */
    const hero = document.querySelector('.hero')
    if (!hero || typeof IntersectionObserver === 'undefined') return

    /* The root's top edge is pulled down 45% of the viewport, so the hero stops
       intersecting once its last 45% has gone past — a little over half a
       screen of scrolling. Declaring the trigger as a margin rather than
       measuring scroll positions means it costs nothing per frame and stays
       correct through every resize without being told about any of them. */
    const io = new IntersectionObserver(
      ([entry]) => setShown(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-45% 0px 0px 0px' },
    )
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* ------------------------------------------------------------
          The refraction
          ------------------------------------------------------------

          What separates glass from frosted plastic is that it bends what is
          behind it. A blur alone gives the second one — the backdrop goes soft
          but stays exactly where it was, which reads as a translucent panel
          rather than as a thing with thickness.

          So the backdrop is pushed around before it is blurred. `feTurbulence`
          draws a smooth two-octave noise field and `feDisplacementMap` reads it
          as a vector per pixel — red for how far to move horizontally, green
          for vertically — so the page behind each chip is warped by a few
          pixels in a direction that varies slowly across it. Under the blur
          that lands as thickness rather than as texture.

          The frequency is low on purpose: at 0.014 one feature of the noise is
          about seventy pixels across, which is wider than the circular chips
          and most of the pill. Each one therefore sits inside a single smooth
          bend instead of a field of ripples — one piece of glass, not a
          pane of bubbled glass.

          The reference technique feeds this a base64 noise PNG rather than
          generating it, and is right that a real bitmap holds up better under
          a light blur. It is also fifteen to twenty kilobytes of unshrinkable
          base64 inlined for three fifty-pixel buttons, which is not a trade
          this page should make. Turbulence at a low frequency is close enough
          at this size; the PNG is the upgrade if these ever grow into panels.

          Rendered once, outside the dock, because a filter is a definition
          rather than a picture — three chips reference this one. It stays in
          the document rather than being display:none'd, which breaks the
          reference in some engines. */}
      <svg className="dock__defs" aria-hidden="true" focusable="false">
        <filter
          id="dock-glass"
          colorInterpolationFilters="sRGB"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014"
            numOctaves="2"
            seed="9"
            result="field"
          />
          {/* Takes the grain off the noise so what is left is the slow
              variation. Without it the displacement carries the turbulence's
              own high frequencies and the backdrop crawls. */}
          <feGaussianBlur in="field" stdDeviation="3" result="smooth" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smooth"
            scale="16"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div className="dock" data-shown={shown ? 'true' : 'false'}>
        <a
          className="dock__round dock__round--telegram"
          href={TELEGRAM}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on Telegram"
          title="Telegram"
        >
          {/* The glass itself, as an element rather than as properties on the
              chip. It carries the tint, the blur and the refraction together,
              so the tint paints over its own filtered backdrop instead of
              underneath it — a white fill behind the displacement is a white
              surface being displaced, which shows nothing. */}
          <span className="dock__glass" aria-hidden="true" />
          <TelegramMark />
        </a>

        <a
          className="dock__round dock__round--whatsapp"
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on WhatsApp"
          title="WhatsApp"
        >
          <span className="dock__glass" aria-hidden="true" />
          <WhatsAppMark />
        </a>

        {/* The page's own conversion, and the same target the navigation's CTA
            points at. Not a second destination — a second door to the one that
            matters, at the end of the page the visitor is actually looking
            at. */}
        <a className="dock__pill" href="#quote">
          <span className="dock__glass" aria-hidden="true" />
          <CalendarCheck
            className="dock__pill-icon"
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
          />
          {/* Wrapped rather than left as a bare text node. The glass is a
              positioned sibling, and a positioned element paints above inline
              content that is not positioned — so without an element of its own
              to lift, the label would sit behind the pane in front of it. */}
          <span className="dock__label">Book a call</span>
        </a>
      </div>
    </>
  )
}

export default ContactDock
