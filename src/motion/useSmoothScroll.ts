/**
 * useSmoothScroll — Lenis, loaded only when it is wanted.
 *
 * Two deliberate choices:
 *  1. `import('lenis')` is dynamic, so Lenis lands in its own chunk and never
 *     blocks the first paint or the hydration of the hero. It is fetched after
 *     the page is interactive, and skipped entirely under reduced motion.
 *  2. Lenis is driven by GSAP's ticker rather than its own rAF loop, and
 *     ScrollTrigger.update runs on every Lenis frame — that is what keeps
 *     pinned sections and scrubbed timelines locked to the smoothed scroll
 *     instead of jittering one frame behind it.
 */
import { useEffect } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion'

interface LenisLike {
  raf: (time: number) => void
  destroy: () => void
  on: (event: string, handler: () => void) => void
}

export const useSmoothScroll = (): void => {
  useEffect(() => {
    if (prefersReducedMotion()) return

    let disposed = false
    let tickerFn: ((time: number) => void) | null = null
    let instance: LenisLike | null = null

    const boot = async (): Promise<void> => {
      const { default: Lenis } = await import('lenis')
      if (disposed) return

      const lenis = new Lenis({
        duration: 1.05,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        lerp: 0.1
      })

      instance = lenis as unknown as LenisLike
      lenis.on('scroll', () => {
        ScrollTrigger.update()
      })

      tickerFn = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tickerFn)
      // Lenis already smooths the scroll; GSAP's own lag smoothing would add a
      // second, competing easing and make pinned sections drift.
      gsap.ticker.lagSmoothing(0)

      window.__lenis = lenis as unknown as Window['__lenis']
      ScrollTrigger.refresh()
    }

    void boot()

    return () => {
      disposed = true
      if (tickerFn) gsap.ticker.remove(tickerFn)
      instance?.destroy()
      delete window.__lenis
    }
  }, [])
}
