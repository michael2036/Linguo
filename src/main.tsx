import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// The splash screen (index.html) paints instantly on cold start, before any
// JS has run. It's meant to read as an intentional "presenting the app"
// beat, not just a flash-of-blank-page guard — so it holds for a minimum
// duration from navigation start, not just until the real UI has painted.
// `performance.now()` here already reports elapsed time since navigation
// start (the splash's own inline HTML/CSS painted during that gap), so on
// a slow load where that alone exceeds the minimum, `remaining` is simply
// 0 and this fires immediately once paint is confirmed.
const MIN_SPLASH_MS = 1200

const splash = document.getElementById('app-splash')
if (splash) {
  const remaining = Math.max(0, MIN_SPLASH_MS - performance.now())
  window.setTimeout(() => {
    // Two rAFs, not one, once the hold elapses — the first just confirms
    // React's commit, the browser paint itself lands on the next frame
    // after that, not merely once React has rendered to the virtual DOM.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        splash.classList.add('app-splash-hidden')
        splash.addEventListener('transitionend', () => splash.remove(), { once: true })
        // Fallback in case transitionend never fires (e.g. the tab was
        // backgrounded mid-transition).
        window.setTimeout(() => splash.remove(), 700)
      })
    })
  }, remaining)
}
