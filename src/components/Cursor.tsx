/**
 * Cursor — the magnetic custom pointer.
 *
 * Renders nothing on a coarse pointer or under reduced motion (and the
 * stylesheet hides it again at those breakpoints, so it cannot get stuck on).
 * Two independent motions:
 *   - the ring chases the real pointer with a lerp (the "weight" of the cursor)
 *   - inside 130 px of an element marked [data-magnetic], the ring is pulled
 *     ~30 % of the way to that element's centre (the magnet)
 *
 * It is a decoration on top of a fully working site: the native cursor is only
 * hidden once this component has confirmed it can run.
 */
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../motion/motion'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const MAGNET_RADIUS = 130
const MAGNET_PULL = 0.3

export const Cursor = () => {
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ringRef.current
    if (!el) return
    if (!window.matchMedia(FINE_POINTER).matches) return
    if (prefersReducedMotion()) return

    document.documentElement.dataset.cursor = 'on'

    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2
    let ringX = pointerX
    let ringY = pointerY
    let magnetEl: HTMLElement | null = null
    let frame = 0
    let running = true
    let isDown = false
    let isOver = false

    const paintState = (): void => {
      el.dataset.state = isDown ? 'down' : isOver ? 'hover' : 'idle'
    }
    const render = (): void => {
      let targetX = pointerX
      let targetY = pointerY

      if (magnetEl) {
        const r = magnetEl.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = cx - pointerX
        const dy = cy - pointerY
        if (Math.hypot(dx, dy) < MAGNET_RADIUS + Math.max(r.width, r.height) / 2) {
          targetX += dx * MAGNET_PULL
          targetY += dy * MAGNET_PULL
        }
      }

      ringX += (targetX - ringX) * 0.18
      ringY += (targetY - ringY) * 0.18
      el.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`
    }

    const loop = (): void => {
      if (!running) return
      render()
      frame = window.requestAnimationFrame(loop)
    }

    const onMove = (event: PointerEvent): void => {
      pointerX = event.clientX
      pointerY = event.clientY
      el.dataset.visible = 'true'
      const target = event.target as Element | null
      isOver = Boolean(target?.closest('a, button, [data-cursor-state="hover"]'))
      paintState()
    }

    const onOver = (event: PointerEvent): void => {
      const target = event.target as Element | null
      magnetEl = target?.closest<HTMLElement>('[data-magnetic]') ?? null
      isOver = Boolean(target?.closest('a, button, [data-magnetic], [data-cursor-state="hover"]'))
      paintState()
    }

    const onDown = (): void => {
      isDown = true
      paintState()
    }
    const onUp = (): void => {
      isDown = false
      paintState()
    }
    const onLeave = (): void => {
      el.dataset.visible = 'false'
      el.dataset.state = 'idle'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    frame = window.requestAnimationFrame(loop)

    return () => {
      running = false
      window.cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      delete document.documentElement.dataset.cursor
    }
  }, [])

  return (
    <div className="cursor" ref={ringRef} aria-hidden="true" data-visible="false" data-state="idle">
      <div className="cursor__ring" />
    </div>
  )
}
