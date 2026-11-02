/**
 * motion.ts — one place that registers GSAP and knows about reduced motion.
 *
 * Every animated component imports gsap/ScrollTrigger from here, so the plugin
 * is registered exactly once and there is a single answer to "is motion
 * allowed?" for the whole site.
 *
 * Rule: nothing may create a tween, a ScrollTrigger or a Lenis instance unless
 * prefersReducedMotion() is false. A reader who asks the OS for less motion gets
 * a completely static page — not a faster one.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches

export type MotionMode = 'full' | 'reduced'

export const motionMode = (): MotionMode => (prefersReducedMotion() ? 'reduced' : 'full')

/* ---------------------------------------------------------------- one curve
   SITE P4 allows exactly one easing curve: cubic-bezier(.22, 1, .36, 1).
   The stylesheet gets it as `--ease`; GSAP does not read CSS custom
   properties, so the same curve is evaluated here and handed to every tween.
   500 ms is the layout duration, 300 ms the hover duration. */
export const SITE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
export const DUR_LAYOUT = 0.5
export const DUR_HOVER = 0.3

const CA = [0.22, 1, 0.36, 1] as const

const bezA = (a1: number, a2: number): number => 1 - 3 * a2 + 3 * a1
const bezB = (a1: number, a2: number): number => 3 * a2 - 6 * a1
const bezC = (a1: number): number => 3 * a1
const bez = (t: number, a1: number, a2: number): number =>
  ((bezA(a1, a2) * t + bezB(a1, a2)) * t + bezC(a1)) * t
const bezSlope = (t: number, a1: number, a2: number): number =>
  3 * bezA(a1, a2) * t * t + 2 * bezB(a1, a2) * t + bezC(a1)

/** cubic-bezier(0.22, 1, 0.36, 1) as a GSAP-compatible ease function. */
export const siteEase = (x: number): number => {
  if (x <= 0) return 0
  if (x >= 1) return 1
  let t = x
  for (let i = 0; i < 8; i += 1) {
    const slope = bezSlope(t, CA[0], CA[2])
    if (slope === 0) break
    t -= (bez(t, CA[0], CA[2]) - x) / slope
  }
  return bez(t, CA[1], CA[3])
}

/**
 * Publishes the current mode on <html data-motion>. The stylesheet keys the
 * "hidden until revealed" state off html[data-motion="full"], so if this never
 * runs (JS off or broken) nothing is hidden in the first place.
 */
export const applyMotionMode = (root: HTMLElement = document.documentElement): MotionMode => {
  const mode = motionMode()
  root.dataset.motion = mode
  return mode
}

/** Window handle used to reach a live Lenis instance without importing it. */
declare global {
  interface Window {
    __lenis?: { scrollTo: (target: unknown, opts?: Record<string, unknown>) => void; destroy: () => void }
  }
}

/** Smooth anchor/scroll helper that prefers Lenis and degrades to the platform. */
export const smoothScrollTo = (target: string | HTMLElement | number, offset = 0): void => {
  const resolved =
    typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target

  if (window.__lenis) {
    window.__lenis.scrollTo(resolved ?? target, { offset, duration: 1.1 })
    return
  }

  if (typeof resolved === 'number') {
    window.scrollTo({ top: resolved + offset, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    return
  }
  if (resolved instanceof HTMLElement) {
    const top = resolved.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}
