import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ColoringGame from './games/coloring'
import './studio.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColoringGame />
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const scope = import.meta.env.BASE_URL
    void navigator.serviceWorker.register(`${scope}sw.js`, { scope }).catch(() => {
      // The studio stays usable online when offline storage is unavailable.
    })
  }, { once: true })
}
