/**
 * useReveals — the one scroll choreography every page uses.
 *
 * SITE P4 replaced the ScrollTrigger.batch reveal with a plain
 * IntersectionObserver, because the spec asks for one: blocks rise from
 * translateY(32px) to 0 and fade in over 700ms, once, when they enter the
 * viewport. The tween itself stays in CSS (see `.reveal` in src/index.css), so
 * the hidden state exists before the first paint and nothing here can leave an
 * element stuck at opacity 0.
 *
 * Parallax is still GSAP: a scrubbed `yPercent` on [data-parallax] inside a
 * .frame, which is a continuous effect rather than a one-shot reveal.
 *
 * Reduced motion short-circuits before anything is created, and since the CSS
 * that hides .reveal only applies under html[data-motion="full"], a reduced
 * reader never sees a hidden element in the first place.
 *
 * A 3.5s failsafe releases anything still invisible that is within the
 * viewport, so an observer that never fires degrades to "no animation" instead
 * of "missing content".
 *
 * SITE P5 Step 6f: IntersectionObserver intersection is clipped by ancestor
 * scroll containers (e.g. .frames below 768px where the last caption sits in a
 * scrollable overflow that never scrolls into view). A geometric fallback checks
 * each target's bounding rect against the viewport enter line on scroll, so
 * clipped targets still receive .is-in once their layout box reaches the
 * viewport.
 */
import { useEffect, type RefObject } from 'react'
import { gsap, prefersReducedMotion } from './motion'

interface RevealOptions {
  selector?: string
  /** per-item transition delay, in ms; capped so a long list never crawls */
  stagger?: number
  staggerCap?: number
}

const ENTER_RATIO = 0.12
const FAILSAFE_MS = 3500
const GEOMETRY_THRESHOLD_RATIO = 0.92

export const useReveals = (
  containerRef: RefObject<HTMLElement | null>,
  { selector = '.reveal', stagger = 60, staggerCap = 400 }: RevealOptions = {}
): void => {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector))

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-in'))
      return
    }

    const reveal = (el: HTMLElement, i: number): void => {
      el.style.transitionDelay = `${Math.min(i * stagger, staggerCap)}ms`
      el.classList.add('is-in')
    }

    const seen = new WeakSet<HTMLElement>()
    const io = new IntersectionObserver(
      (entries) => {
        let i = 0
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (!entry.isIntersecting || seen.has(el)) continue
          seen.add(el)
          reveal(el, i)
          i += 1
          io.unobserve(el)
        }
      },
      { threshold: ENTER_RATIO, rootMargin: '0px 0px -8% 0px' }
    )

    // Anything already on screen at mount must not wait for a scroll event.
    targets.forEach((el) => io.observe(el))

    const failsafe = window.setTimeout(() => {
      targets.forEach((el, i) => {
        if (el.classList.contains('is-in')) return
        if (el.getBoundingClientRect().top < window.innerHeight) reveal(el, i)
      })
    }, FAILSAFE_MS)

    // --- GEOMETRIC FALLBACK: clip-independent enter detection ---
    // The IntersectionObserver may report zero intersection for targets whose
    // ancestor scroll containers clip (e.g. .frames below 768px where the last
    // caption sits in a scrollable overflow that never scrolls into view).
    // On each window scroll, rAF-throttled, check each target's bounding rect
    // against the viewport enter line. This fires regardless of clipping.
    let geometryScrollListener: (() => void) | null
    let geometryRafId: number | null = null
    const geometryTargetsCount = targets.length
    let geometryRevealedCount = 0

    const geometryCheck = () => {
        if (geometryRevealedCount >= geometryTargetsCount) return
        const enterLine = window.innerHeight * GEOMETRY_THRESHOLD_RATIO
        for (const el of targets) {
          if (seen.has(el)) continue
          const rect = el.getBoundingClientRect()
          if (rect.top < enterLine || rect.bottom < 0) {
            reveal(el, targets.indexOf(el))
            seen.add(el)
            io.unobserve(el)
            geometryRevealedCount += 1
          }
        }
        // If every target has been revealed, stop listening.
        if (geometryRevealedCount >= geometryTargetsCount) {
          if (geometryScrollListener) {
            window.removeEventListener('scroll', geometryScrollListener, true)
            geometryScrollListener = null
          }
        }
      }

    // Passive rAF-based scroll listener, throttled to one check per rAF frame.
    const geometryScrollHandler = () => {
      if (geometryRafId !== null) return // already scheduled
      geometryRafId = window.requestAnimationFrame(() => {
        geometryRafId = null
        geometryCheck()
      })
    }

    geometryScrollListener = geometryScrollHandler
    window.addEventListener('scroll', geometryScrollHandler, true)

    // --- parallax (contributing author: GSAP, scrubbed, continuous)
    const parallax = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        const amount = Number(el.dataset.parallax) || 8
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('.frame') ?? el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          }
        )
      })
    }, root)

    return () => {
      window.clearTimeout(failsafe)
      io.disconnect()
      if (geometryScrollListener) {
        window.removeEventListener('scroll', geometryScrollListener, true)
        geometryScrollListener = null
      }
      if (geometryRafId !== null) {
        window.cancelAnimationFrame(geometryRafId)
        geometryRafId = null
      }
      parallax.revert()
    }
  }, [containerRef, selector, stagger, staggerCap])
}
