import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { applyMotionMode } from './motion/motion'
import './index.css'

// index.html already stamped data-motion before the first paint; this re-asserts
// it from the module graph, so the attribute can never drift from what motion.ts
// reports to every component that creates a tween.
applyMotionMode()

// React 18 clears #root when the root mounts, which is what removes the
// pre-hydration boot shell — no manual teardown, and therefore no frame where
// the container is empty and the screen is blank.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)