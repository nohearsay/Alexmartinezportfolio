import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface MotionWrapperProps {
  children: React.ReactNode
  trigger?: string | Element
  start?: string
  end?: string
  scrub?: boolean | number
  onEnter?: () => void
  onLeave?: () => void
  onEnterBack?: () => void
  onLeaveBack?: () => void
  className?: string
  style?: React.CSSProperties
}

export const MotionWrapper = React.forwardRef<HTMLDivElement, MotionWrapperProps>(
  ({ children, trigger, start = 'top 80%', end = 'bottom 20%', scrub = false, onEnter, onLeave, onEnterBack, onLeaveBack, className = '', style, ...props }, ref) => {
    const elementRef = useRef<HTMLDivElement | null>(null)
    const scrollTriggerRef = useRef<ScrollTrigger | null>(null)
    const setRef = (el: HTMLDivElement | null) => {
      elementRef.current = el
      if (ref) {
        if (typeof ref === 'function') {
          ref(el)
        } else {
          ref.current = el
        }
      }
    }

    useEffect(() => {
      const el = elementRef.current
      if (!el) return

      const ctx = gsap.context(() => {
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: trigger || el,
          start,
          end,
          scrub,
          onEnter,
          onLeave,
          onEnterBack,
          onLeaveBack,
          markers: false
        })
      }, el)

      return () => {
        ctx.revert()
        scrollTriggerRef.current?.kill()
      }
    }, [trigger, start, end, scrub, onEnter, onLeave, onEnterBack, onLeaveBack])

    return (
      <div ref={setRef} className={className} style={style} {...props}>
        {children}
      </div>
    )
  }
)

MotionWrapper.displayName = 'MotionWrapper'

export interface StaggerChildrenProps {
  children: React.ReactNode
  stagger?: number
  from?: 'start' | 'center' | 'end' | 'edges' | 'random'
  ease?: string
  duration?: number
  className?: string
}

export const StaggerChildren = ({ children, stagger = 0.1, from = 'start', ease = 'power2.out', duration = 0.6, className = '' }: StaggerChildrenProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        opacity: 0,
        y: 30,
        duration,
        ease,
        stagger: { amount: stagger * (el.children.length - 1), from }
      })
    }, el)

    return () => ctx.revert()
  }, [stagger, from, ease, duration])

  return <div ref={containerRef} className={className}>{children}</div>
}

export interface ParallaxProps {
  children: React.ReactNode
  speed?: number
  className?: string
  style?: React.CSSProperties
}

export const Parallax = ({ children, speed = 0.3, className = '', style, ...props }: ParallaxProps) => {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: -50 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    }, el)

    return () => ctx.revert()
  }, [speed])

  return (
    <div ref={elementRef} className={className} style={{ ...style, willChange: 'transform' }} {...props}>
      {children}
    </div>
  )
}