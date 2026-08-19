import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar.jsx'
import HeroHeadline from './components/HeroHeadline.jsx'
import ModeToggle from './components/ModeToggle.jsx'
import BackgroundTransition from './components/BackgroundTransition.jsx'
import { startSmoothScroll } from './smoothScroll.js'
import { startSectionSnap } from './sectionSnap.js'
import HowItWorks from './components/HowItWorks.jsx'
import FilmReveal from './components/FilmReveal.jsx'
import OurCasesSection from './components/OurCasesSection.jsx'
import AboutSection from './components/AboutSection.jsx'
import QuoteBand from './components/QuoteBand.jsx'
import ClosingSequence from './components/ClosingSequence.jsx'
import ContactDock from './components/ContactDock.jsx'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function App() {
  const [mode, setMode] = useState('morning')
  // Locked while the background drop transition is running.
  const [locked, setLocked] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const unlockTimer = useRef(null)
  const heroRef = useRef(null)

  const handleModeChange = useCallback(
    (next) => {
      if (next === mode || locked) return
      setMode(next)
      setLocked(true)

      // Safety fallback in case the animation-complete callback never fires.
      clearTimeout(unlockTimer.current)
      unlockTimer.current = setTimeout(
        () => setLocked(false),
        reducedMotion ? 300 : 1200,
      )
    },
    [mode, locked, reducedMotion],
  )

  const handleTransitionComplete = useCallback(() => {
    clearTimeout(unlockTimer.current)
    setLocked(false)
  }, [])

  useEffect(() => () => clearTimeout(unlockTimer.current), [])

  /* Keyed on the reduced-motion preference so that turning it on mid-session
     tears the smoothing down and hands the page back to the browser, rather
     than leaving it running until a reload. */
  useEffect(() => startSmoothScroll(), [reducedMotion])

  /* After the smoothing, and that order is required rather than tidy: the seam
     moves the page through Lenis, so Lenis has to exist by the time it fires.
     Keyed on the same preference for the same reason — a page that takes the
     scroll over is the first thing that should stop doing so. */
  useEffect(() => startSectionSnap(), [reducedMotion])

  /* The page's one remeasure, for every section that pins or scrubs.

     Two things move sections down the page and both finish after the triggers
     have been built: images arriving, and fonts. The display type is set at
     clamp sizes on a 920px measure, so Albert Sans landing changes heights by
     enough to move everything under it — and that happens after first paint.
     Without a refresh afterwards, every pin keeps whatever it measured during
     mount, which is a pan that stops early and a seam that lands off its mark.

     It is scheduled here rather than in the sections that need it because
     `ScrollTrigger.refresh()` is global: one call recalculates every trigger on
     the page. How It Works and About each used to schedule their own on `load`
     and again on `fonts.ready`, so a settle that happens once was answered with
     four full recalculations of all ~21 triggers. One is the correct number.

     Debounced to a frame so the two signals below collapse into a single pass
     when they arrive together, which on a warm cache they do. The `readyState`
     branch is not tidiness either: the bundle can execute after the window has
     already loaded, and a bare `load` listener would then be waiting for an
     event that has been and gone. */
  useEffect(() => {
    let frame = 0
    let cancelled = false

    const refresh = () => {
      if (cancelled) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    }

    if (document.readyState === 'complete') refresh()
    else window.addEventListener('load', refresh)

    /* Guarded, unlike the three copies this replaces. A refresh after unmount
       is harmless today, but an unguarded promise callback reaching for torn
       down state is the shape the next bug takes. */
    document.fonts?.ready.then(refresh)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <main>
      {/* The section is the parallax host as well as the frame. It is what the
          effect measures against, and it is the one element both the
          background and the headline sit inside — which is what lets the
          house and the type be driven by the same two numbers. */}
      <section
        className={`hero hero--${mode}`}
        data-mode={mode}
        ref={heroRef}
      >
        <BackgroundTransition
          mode={mode}
          hostRef={heroRef}
          reducedMotion={reducedMotion}
          onTransitionComplete={handleTransitionComplete}
        />

        <div className="hero__overlay" aria-hidden="true" />
        <div className="hero__fog" aria-hidden="true" />
        <div className="hero__bottom-gradient" aria-hidden="true" />

        <Navbar />
        <HeroHeadline />

        <div className="hero__bottom">
          <ModeToggle
            mode={mode}
            onChange={handleModeChange}
            locked={locked}
            reducedMotion={reducedMotion}
          />
          <p className="hero__description">
            Forget the energy market, weather conditions and seasons; our Smart
            Controller guarantees you get no electricity bill for seven years.
          </p>
        </div>
      </section>

      {/* No longer takes the mode. The section is night at every hour now, so
          the toggle has nothing to say to it. */}
      <HowItWorks />
      {/* Between the explanation and the proof, and it has to be exactly here:
          the ledger says what the system does and Our Cases says who it did it
          for, so this is the one place on the page where showing it running is
          not a third argument. It takes the scroll for two gestures — see the
          header of FilmReveal.jsx — which is why it sits against a section
          that ends in flow rather than one that pins. */}
      <FilmReveal />
      <OurCasesSection />
      <AboutSection />
      {/* Directly after About, which ends on the guarantee at dusk. That is
          where the page has spent everything it has, and until now it was also
          where the page went quiet. */}
      <QuoteBand />
      <ClosingSequence />

      {/* Last in the markup and fixed to the viewport, so it is over every
          section without being inside any of them. It is also the last thing
          in the tab order, which is the right place for a persistent shortcut:
          it should be reachable from anywhere, not stand between the
          navigation and the page. */}
      <ContactDock />
    </main>
  )
}

export default App
