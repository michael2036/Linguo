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
// JS has run. Fade it out only once the real UI has actually painted (two
// rAFs, not one — the first just confirms React's commit, the browser paint
// itself lands on the next frame after that), not merely once React has
// rendered to the virtual DOM.
const splash = document.getElementById('app-splash')
if (splash) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      splash.classList.add('app-splash-hidden')
      splash.addEventListener('transitionend', () => splash.remove(), { once: true })
      // Fallback in case transitionend never fires (e.g. the tab was
      // backgrounded mid-transition).
      window.setTimeout(() => splash.remove(), 700)
    })
  })
}
