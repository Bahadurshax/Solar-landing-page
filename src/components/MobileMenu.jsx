import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Menu, X, Zap } from 'lucide-react'
import { DESKTOP_NAV } from '../breakpoints.js'
import {
  pauseSmoothScroll,
  resumeSmoothScroll,
  scrollTo,
} from '../smoothScroll.js'
import '../styles/mobile-menu.css'

/* ============================================================
   Mobile and tablet navigation
   ============================================================

   The six primary links used to be display:none below 900px and nothing took
   their place, so on a phone they simply did not exist. This is where they go.

   Portalled to <body> rather than rendered where it sits. The trigger lives
   inside the navbar, which is absolutely positioned inside the hero — and the
   hero clips its overflow while the header itself is a motion element that
   holds a transform. Either one is enough to capture a position:fixed child
   and clip a full-screen panel to the header's own 78px box. Going through the
   portal steps outside both.

   Everything about the panel's visibility is the `open` branch below: when it
   is closed nothing is in the document at all. That is deliberate — a panel
   hidden with CSS alone is still reachable by tab and still read out, and this
   one holds every link on the site. */

/* Matches the point the inline nav gives up in the stylesheet. The two have to
   agree: if this were the wider of the pair there would be a band with no
   navigation at all, and if it were the narrower there would be a band showing
   both at once. Now imported rather than written out here — see breakpoints.js
   for why the stylesheet still keeps its own copy. */
const DESKTOP = DESKTOP_NAV

const PANEL_MOTION = {
  initial: { opacity: 0, y: -14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
}

const LIST_MOTION = {
  animate: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
}

const ITEM_MOTION = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

function MobileMenu({ links }) {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP).matches,
  )
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const wasOpen = useRef(false)
  const reduced = useReducedMotion()

  const close = useCallback(() => setOpen(false), [])

  /* Close, then go — and in that order, a frame apart.

     Every link in here leaves the panel, and the panel holds the page still
     while it is up. Handled as one click the anchor would be resolved while
     the scroll was still locked and the destination would simply be swallowed:
     the menu would close onto the same view it opened over. The frame's grace
     is the effect above lifting its lock, which happens on the commit that
     closing schedules. */
  const closeAndGo = useCallback(
    (href) => (event) => {
      close()
      event.preventDefault()

      /* `#` is a placeholder for a section that does not exist yet, and it
         goes to the top of the page — the behaviour those links already had.
         Spelled out rather than handed back to the browser, because Lenis
         claims in-page links itself and would cancel the native jump while
         still being too stopped to make one of its own. */
      const target = !href || href === '#' ? 0 : href
      requestAnimationFrame(() => scrollTo(target))
    },
    [close],
  )

  /* Grown past the breakpoint while open — the trigger has just been hidden by
     the stylesheet, so without this the panel is left covering a desktop
     layout with no visible way to dismiss it.

     Both pieces of state, and they do different jobs. Clearing `open` is the
     close; `isDesktop` unmounts the AnimatePresence outright below. Relying on
     `open` alone left the panel in the document in roughly half of resizes:
     the close is correct — aria-expanded flips, the scroll lock lifts — but
     the exit animation it hands to AnimatePresence sometimes never finishes
     across a viewport change, and a presence animation that never completes
     never unmounts its child. The panel stayed up over the desktop layout with
     the focus trap still live inside it.

     A graceful fade is the wrong thing here anyway. Every other way out of
     this menu is a decision to leave it, and it should fade. Crossing the
     breakpoint means the menu no longer exists at this size, and the honest
     answer to that is for it to be gone. */
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP)
    const onChange = (e) => {
      setIsDesktop(e.matches)
      if (e.matches) setOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  /* Escape, the tab trap, and the scroll lock. All three only exist while the
     panel is up, which is why they share an effect keyed on `open`. */
  useEffect(() => {
    if (!open) return

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)

    /* Restoring the inline value rather than clearing it: body carries
       `overflow-x: clip` from the stylesheet, and blanking the property here
       would hand the page back a horizontal scrollbar it deliberately does
       not have. An empty string restores the stylesheet's value. */
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    /* And the same lock again, in the one language the smooth scrolling
       understands. `overflow: hidden` stops the browser scrolling the page,
       but Lenis does not ask the browser — it sets the scroll position itself
       every frame, so behind the open panel the page would still be gliding
       around under the wheel. */
    pauseSmoothScroll()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
      resumeSmoothScroll()
    }
  }, [open])

  /* Focus in on open, and back to the trigger on close — but not on first
     render, which is why this tracks the previous state rather than reacting
     to `open` being false. Landing focus on the close button rather than the
     first link means the way out is the first thing a keyboard reaches. */
  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector('[data-menu-close]')?.focus()
    } else if (wasOpen.current) {
      triggerRef.current?.focus()
    }
    wasOpen.current = open
  }, [open])

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="navbar__burger"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu size={24} strokeWidth={2} aria-hidden="true" />
      </button>

      {/* Not rendered at all above the breakpoint, so crossing it takes the
          whole presence tree with it synchronously rather than leaving an exit
          animation to finish. */}
      {!isDesktop &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                /* AnimatePresence tracks its children by key, and without one
                   it cannot reliably tell an exiting child from a removed one.
                   Left off, the exit animation stalled unpredictably and the
                   panel stayed in the document after Escape or the close
                   button — state correct, element still there. */
                key="site-menu"
                id="site-menu"
                ref={panelRef}
                className="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                {...(reduced ? {} : PANEL_MOTION)}
              >
                <div className="mobile-menu__bar">
                  <span className="mobile-menu__brand">
                    <Zap size={30} strokeWidth={2.4} aria-hidden="true" />
                    <span className="mobile-menu__brand-name">Solstice</span>
                  </span>

                  <button
                    type="button"
                    data-menu-close
                    className="mobile-menu__close"
                    aria-label="Close menu"
                    onClick={close}
                  >
                    <X size={24} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>

                <motion.nav
                  className="mobile-menu__nav"
                  aria-label="Primary"
                  {...(reduced
                    ? {}
                    : {
                        variants: LIST_MOTION,
                        initial: 'initial',
                        animate: 'animate',
                      })}
                >
                  {links.map((link) => (
                    <motion.a
                      key={link.label}
                      className="mobile-menu__link"
                      href={link.href}
                      onClick={closeAndGo(link.href)}
                      {...(reduced ? {} : { variants: ITEM_MOTION })}
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </motion.nav>

                {/* The bar's own CTA is behind the panel while this is up, so the
                  primary action is repeated here rather than being one of the
                  things the menu hides. */}
                <a
                  className="mobile-menu__cta"
                  href="#quote"
                  onClick={closeAndGo('#quote')}
                >
                  Schedule Installation
                </a>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}

export default MobileMenu
