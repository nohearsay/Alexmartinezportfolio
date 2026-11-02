/**
 * RouteTransition — the page transition, and the single <main> landmark.
 *
 * Why it owns <main> instead of wrapping one: animating an extra wrapper div
 * around the page would put a clip-path (and, in some browsers, a containing
 * block) between the fixed header and the content. Animating the landmark
 * itself keeps one <main> in the tree — which is also what tools/verify-render
 * counts — and leaves the chrome untouched.
 *
 * Two layers of transition, deliberately:
 *  1. this component's own clip-path wipe + fade on every client-side route
 *     change. It is deterministic: it does not depend on the View Transitions
 *     API existing, and it is the one a QA pass will always see;
 *  2. the native API for cross-document navigations, declared in CSS as
 *     `@view-transition { navigation: auto }` with ::view-transition-old/new
 *     keyframes, so a real multi-page load (and a browser that supports it)
 *     gets the same language for free.
 *
 * Reduced motion: nothing is animated and the scroll still resets to the top —
 * motion is decoration, the scroll reset is function.
 */
import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReducedMotion, smoothScrollTo } from '../motion/motion'

export const RouteTransition = () => {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    // Enter the new page at the top, through Lenis when it is running so the
    // smooth-scroll instance and the real scroll position never disagree.
    smoothScrollTo(0)

    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (prefersReducedMotion()) {
      ScrollTrigger.refresh()
      return
    }

    const tl = gsap.timeline()
    tl.fromTo(
      el,
      { clipPath: 'inset(0 0 100% 0)', opacity: 0.4 },
      {
        clipPath: 'inset(0 0 0% 0)',
        opacity: 1,
        duration: 0.62,
        ease: 'expo.out',
        // clearProps matters: a leftover clip-path on <main> would clip the
        // pinned case-study sections that live inside it.
        clearProps: 'clipPath,opacity'
      }
    )

    // The new route's sections have different heights, so every trigger built
    // against the old page must be re-measured once the wipe has finished.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 700)

    return () => {
      window.clearTimeout(id)
      tl.kill()
      gsap.set(el, { clearProps: 'clipPath,opacity' })
    }
  }, [pathname])

  return (
    <main id="main-content" ref={mainRef} key={pathname}>
      <Outlet />
    </main>
  )
}
