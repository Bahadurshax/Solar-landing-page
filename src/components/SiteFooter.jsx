/* The end of the page.

   It used to arrive by pushing: ClosingSequence held it below the bottom edge
   of a clipped stage and brought it up under the testimonial wall. That is
   gone, and two constraints went with it. The footer is no longer held in a
   one-screen frame, so nothing here has to be sized to clear a short laptop,
   and it is no longer absolutely positioned, so it is simply the last block on
   the page. */

import { useEffect, useRef } from "react";
import { ArrowUp, ArrowRight, Mail, Phone } from "lucide-react";
import { scrollTo } from "../smoothScroll.js";

/* Titled now, because the footer no longer sets its links in one anonymous
   band. Two named groups under a centred call to action is a shape that has
   to say what each column is, or the reader has to taste every link to find
   out where it goes. */
const NAV_COLUMNS = [
  {
    title: "Explore",
    links: ["Home", "Benefits", "Product", "How It Works"],
  },
  {
    title: "Company",
    links: ["Our Cases", "Reviews", "Careers", "Contact Us"],
  },
];

const CONTACTS = [
  {
    Icon: Mail,
    label: "Email",
    value: "contact@solstice.energy",
    href: "mailto:contact@solstice.energy",
  },
  {
    Icon: Phone,
    label: "Phone Number",
    value: "+998 (61) 224-8372",
    href: "tel:+998612248372",
  },
];

/* Eight rays and a core. Drawn rather than pulled from the icon set because it
   is set at the wordmark's cap height, where a 24px stroke icon scaled up
   twenty times shows every rounding artefact it has. */
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

/* Split so each cap can be given its own delay. Kerning between the letters is
   lost the moment they become inline-blocks, which is why the monument is set
   at tracking zero in a face that needs none — nothing here was relying on a
   kern pair. */
const WORDMARK = "Solstice".split("");

/* Enters on the way up, leaves only once the monument is fully gone, so a
   scrub that parks the lockup half on screen cannot flutter the letters on and
   off. The high edge is deliberately late: the monument is the last thing the
   footer brings with it, and the letters should start after it has arrived
   rather than while it is still climbing. */
const RISE_IN = 0.55;

function SolsticeMark({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <circle cx="50" cy="50" r="18.5" />
      {RAYS.map((angle) => (
        <rect
          key={angle}
          x="43.5"
          y="2"
          width="13"
          height="26"
          rx="6.5"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
    </svg>
  );
}

function SiteFooter() {
  const monumentRef = useRef(null);

  /* An observer rather than a ScrollTrigger. It was chosen because the footer
     was being translated by the push timeline and had no stable scroll
     position to key off; with the push gone a ScrollTrigger would work, but
     the observer is still the better tool for the question actually being
     asked, which is only whether the letters are on screen. It measures that
     through the footer's own clip, which a scroll position does not.

     One shot: it fires the rise the first time the lockup is properly on
     screen and then disconnects. It used to also clear the class on the way
     out, so the monument re-ran its rise on every return to the bottom of the
     page — and the bottom of the page is somewhere a reader passes through
     repeatedly, scrolling back up to a section and down again. An arrival
     that happens every time stops reading as an arrival. */
  useEffect(() => {
    const el = monumentRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-risen");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < RISE_IN) return;
        el.classList.add("is-risen");
        io.disconnect();
      },
      { threshold: [0, RISE_IN] },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Routed through the page's own scrolling rather than `window.scrollTo`.
     With smoothing on, a native scroll is overwritten on the next frame by
     wherever Lenis thought the page was going, so the button either fought the
     easing or did nothing at all. `scrollTo` still falls back to the native
     call, and to no animation at all under reduced motion, when there is no
     Lenis to route through. */
  const scrollToTop = () => scrollTo(0);
  const scrollToQuote = () => scrollTo("#quote");

  return (
    <footer className="site-footer" data-footer>
      {/* Everything the footer paints lives in here rather than on the footer
          itself. The body clips — the monument is cropped by its bottom edge —
          and the shadow the footer casts upward onto the wall has to be
          outside anything that clips, or it is cut off at the very edge it is
          supposed to reach over. */}
      <div className="site-footer__body">
        {/* The signature of the reference: enormous rounded rectangles drawn
            at a hairline, overlapping and running off every edge. They are the
            only thing on the plate besides type, so they carry the whole
            surface — one hair too bright and they become a diagram. */}
        <div className="site-footer__frames" aria-hidden="true">
          <span className="site-footer__frame site-footer__frame--a" />
          <span className="site-footer__frame site-footer__frame--b" />
          <span className="site-footer__frame site-footer__frame--c" />
        </div>

        <div className="site-footer__inner">
          {/* Centred, and given the room a closing line needs. Everything
              below it is a directory; this is the last thing the page
              actually says. */}
          <div className="site-footer__call">
            <h2 className="site-footer__line">
              Clean energy
              <br />
              that works
              <span className="site-footer__seal" aria-hidden="true">
                <SolsticeMark className="site-footer__seal-mark" />
              </span>
            </h2>

            <button
              type="button"
              className="site-footer__cta"
              onClick={scrollToQuote}
            >
              Get your estimate
              <span className="site-footer__cta-icon" aria-hidden="true">
                <ArrowRight size={15} strokeWidth={2.2} />
              </span>
            </button>
          </div>

          {/* The directory band: who, where to go, how to reach a person.
              Four columns on a wide screen, and the brand is given the first
              one on its own so the lockup has air around it rather than
              sitting as a fifth link list. */}
          <div className="site-footer__grid">
            <div className="site-footer__brand">
              <span className="site-footer__brand-lockup">
                <SolsticeMark className="site-footer__brand-mark" />
                Solstice
              </span>
              <p className="site-footer__brand-note">
                Solar design, supply and installation
                <br />
                across Karakalpakstan.
              </p>
            </div>

            <nav className="site-footer__nav" aria-label="Footer">
              {NAV_COLUMNS.map((column) => (
                <div className="site-footer__column" key={column.title}>
                  <h3 className="site-footer__column-title">{column.title}</h3>
                  <ul className="site-footer__list">
                    {column.links.map((link) => (
                      <li key={link}>
                        <a className="site-footer__link" href="#">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="site-footer__reach">
              <h3 className="site-footer__column-title">Reach us</h3>
              <p className="site-footer__reach-line">
                Ready to run on your own roof?
              </p>

              <div className="site-footer__contacts">
                {CONTACTS.map(({ Icon, label, value, href }) => (
                  <div className="site-footer__contact" key={label}>
                    <span
                      className="site-footer__contact-icon"
                      aria-hidden="true"
                    >
                      <Icon size={15} strokeWidth={2} />
                    </span>
                    <span className="site-footer__contact-text">
                      <span className="site-footer__contact-label">
                        {label}
                      </span>
                      <a className="site-footer__contact-value" href={href}>
                        {value}
                      </a>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The way back up sits at the *left* end of this strip, beside the
              copyright, and not at the right where it belongs by convention.
              The page carries a fixed contact dock in the bottom-right corner
              that floats over everything, so the right end of the last line in
              the document is the one place a control cannot go. */}
          <div className="site-footer__base">
            <div className="site-footer__base-left">
              <button
                type="button"
                className="site-footer__totop"
                onClick={scrollToTop}
              >
                Scroll to top
                <span className="site-footer__totop-icon" aria-hidden="true">
                  <ArrowUp size={14} strokeWidth={2.2} />
                </span>
              </button>

              <p className="site-footer__legal">
                Nukus, Karakalpakstan
                <span className="site-footer__legal-sep" aria-hidden="true">
                  ·
                </span>
                © 2026 Solstice Energy
              </p>
            </div>

            <p className="site-footer__legal site-footer__legal--right">
              <a className="site-footer__link" href="#">
                Privacy
              </a>
              <span className="site-footer__legal-sep" aria-hidden="true">
                ·
              </span>
              <a className="site-footer__link" href="#">
                Terms
              </a>
            </p>
          </div>
        </div>

        {/* The page's one held note. It is the brand at architectural scale,
          cropped by the bottom edge because a wordmark that fits inside the
          frame is a logo and one that does not is a building. Decorative:
          the name is already in the navigation, the title and the copy. */}
        <div
          className="site-footer__monument"
          aria-hidden="true"
          ref={monumentRef}
        >
          <SolsticeMark
            className="site-footer__monument-mark"
            style={{ "--i": 0 }}
          />
          <span className="site-footer__monument-word">
            {WORDMARK.map((letter, i) => (
              <span
                className="site-footer__monument-letter"
                key={`${letter}-${i}`}
                /* The mark leads at 0, so the caps start one step behind it and
                 the whole lockup reads as one rise instead of a logo with an
                 animation bolted to the side of it. */
                style={{ "--i": i + 1 }}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
