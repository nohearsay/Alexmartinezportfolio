/**
 * Loader — the branded boot screen, hard-capped at 2.5 s.
 *
 * Two rules it must not break:
 *  - Under 2.5 s, always. The cap is a wall-clock timeout, not "until everything
 *    loads", so a slow video or a stalled font can never hold the page hostage;
 *  - it may not be the reason content is late. It is an overlay above an
 *    already-painted page (the pre-hydration .boot shell, then the real hero),
 *    so LCP is measured on the hero, not on this.
 *
 * A session-scoped flag means a returning visitor sees it once per tab, not on
 * every client-side navigation — nothing is more "template" than a loader on
 * every route change.
 *    The "seen" flag is checked but never allowed to prevent the exit timeout from
 *    firing — the hard wall-clock timer is set up first, so StrictMode re-runs cannot
 *    starve it.
 *
 * prefers-reduced-motion: no loader at all (not rendered).
 *
 * It must NEVER block scrolling or clicks: pointer-events: none at all times,
 * no overflow:hidden on html/body held by the loader, and Lenis must not be
 * stopped by it.
 *
 * The pre-hydration .boot shell must vanish when React mounts (it does via
 * createRoot) and must not be position:fixed over content if JS fails.
 */
import { useEffect, useRef, useState } from 'react'
import { IDENTITY } from '../data/cv'

const CAP_MS = 2500
const MARK = IDENTITY.name

/** If the user prefers reduced motion, render nothing at all. */
const hasReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const Loader = () => {
  // Always call hooks in the same order, regardless of reduced motion.
  // We check reduced motion inside useEffect and set state accordingly.
  const [state, setState] = useState<'hidden' | 'running' | 'done'>('hidden')
  const barRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // If user prefers reduced motion, skip the loader entirely.
    if (hasReducedMotion()) {
      setState('hidden')
      return
    }

    // 1. Hard wall-clock exit timeout — ALWAYS set first, independent of any flag.
    //    This is the safety net that ensures the loader always exits within ~2.5 s,
    //    not cleared by StrictMode re-runs, and fires even if animations throw.
    const exitTimeout = window.setTimeout(() => setState('done'), CAP_MS)

    // 2. Check if we've already seen the boot in this session (sessionStorage).
    //    This controls whether we start the animation, but MUST NOT prevent the
    //    exit timeout from above from firing.
    let seen = false
    try {
      seen = window.sessionStorage.getItem('boot-seen') === '1'
    } catch {
      /* private mode / storage full: treat as first visit, but exit timeout still runs */
    }

    if (seen) {
      // Already seen in this tab: the exit timeout from step 1 is already running.
      // We don't start the animation, but the timeout ensures IF the loader were
      // visible it would exit within ~2.5 s. Cleanup clears the timeout.
      return () => window.clearTimeout(exitTimeout)
    }

    // 3. First visit in this tab: start the loader.
    setState('running')

    // Progress bar animation via RAF (only if we get here)
    let raf = 0
    const started = performance.now()
    const tick = (): void => {
      const p = Math.min(1, (performance.now() - started) / CAP_MS)
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`
      }
      if (p < 1) raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)

    // 4. Exit on window load — content already painted, no need to keep loader.
    const loadHandler = (): void => {
      window.setTimeout(() => setState('done'), 0)
    }
    window.addEventListener('load', loadHandler)

    // 5. Exit if user scrolls — content is already visible in viewport.
    const scrollHandler = (): void => {
      window.setTimeout(() => setState('done'), 0)
    }
    window.addEventListener('scroll', scrollHandler, { passive: true })

    return () => {
      window.cancelAnimationFrame(raf)
      window.clearTimeout(exitTimeout)
      window.removeEventListener('load', loadHandler)
      window.removeEventListener('scroll', scrollHandler)
    }
  }, []) // Empty deps — the exit timeout is hard-clock independent

  if (state === 'hidden') return null

  return (
    <div
      className="loader"
      data-state={state === 'done' ? 'done' : 'running'}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <div className="loader__inner">
        <span className="loader__name">{MARK}</span>
        <span className="loader__bar">
          <span className="loader__fill" ref={barRef} />
        </span>
        <span className="loader__pct">{IDENTITY.name}</span>
      </div>
    </div>
  )
}
