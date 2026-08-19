import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* The live-reload tooling injects a <script> pointing at localhost into
   index.html, and index.html is a tracked file — so an injection that outlives
   the session it belonged to gets committed, and from there it is copied
   verbatim into dist/. A visitor then loads a page that blocks on a host that
   cannot exist for them, and the injected token is published in the source.

   That already happened once. This strips the block from the production HTML
   regardless of what is in the file, so the failure cannot repeat: dev keeps
   whatever the tooling puts there, and the build never carries it. */
function stripDevInjections() {
  return {
    name: 'strip-dev-injections',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        /\n?[ \t]*<!-- impeccable-live-start -->[\s\S]*?<!-- impeccable-live-end -->\n?/g,
        '\n',
      )
    },
  }
}

/* One chunk per dependency that has its own release cadence, plus one for the
   page's own code.

   Not code splitting — nothing here is deferred, and every chunk is a static
   import fetched on the same pass. Splitting for *deferral* was considered and
   rejected: measured, the entire application is 61 KB of the 516 KB bundle, and
   the three large dependencies are all on the critical path (Motion drives the
   hero swap and the navbar, GSAP and Lenis drive the smooth scroll before
   anything below the fold exists). Deferring sections would have moved a slice
   of that 61 KB while introducing async boundaries into a page whose layout is
   almost entirely pinned scroll choreography — the wrong trade.

   Splitting for *caching* is a different question with a better answer. As one
   file, editing a line of copy invalidates all 516 KB, React and GSAP included.
   Split, a copy change re-downloads 61 KB and everything else is still in the
   visitor's cache. The browser also fetches these in parallel and parses them
   off one another's critical path. */
const VENDORS = [
  { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
  { name: 'gsap', test: /node_modules[\\/](gsap|@gsap)[\\/]/ },
  {
    name: 'motion',
    test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/,
  },
  { name: 'lenis', test: /node_modules[\\/]lenis[\\/]/ },
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stripDevInjections()],
  build: {
    rolldownOptions: {
      output: { advancedChunks: { groups: VENDORS } },
    },
  },
})
