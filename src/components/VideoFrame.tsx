/**
 * VideoFrame — every video on the site, with the same three rules applied:
 *
 *  1. `preload="none"` + a small poster: nothing is downloaded until the frame
 *     is close to the viewport, and the poster is what LCP actually measures.
 *  2. Playback is driven by an IntersectionObserver, so off-screen videos are
 *     paused (eight videos autoplaying at once is the classic way to fail a
 *     performance budget on a phone).
 *  3. Under prefers-reduced-motion the video never plays at all — the poster
 *     stands in for it, which is also why every one of these has a poster.
 *
 * `muted` is set through the element rather than the attribute: React does not
 * write the muted *attribute* into the DOM, and a video without it cannot
 * autoplay in Chromium.
 *
 * SITE P4: a frame may name a `fallbackPoster`. If the primary poster fails to
 * load the element swaps to it, so a missing file degrades to a different
 * still rather than to a black box.
 */
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../motion/motion'

interface VideoFrameProps {
  src: string
  poster: string
  className?: string
  /** webm alternative, when one exists */
  webm?: string
  /** second-choice poster, used when the first one 404s */
  fallbackPoster?: string
  /** wait for the window load event before the first play() (hero only) */
  waitForLoad?: boolean
  /** start as soon as the component mounts rather than when it scrolls in */
  eager?: boolean
}

export const VideoFrame = ({
  src,
  poster,
  className = '',
  webm,
  fallbackPoster,
  waitForLoad = false,
  eager = false
}: VideoFrameProps) => {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.muted = true
    el.playsInline = true

    if (prefersReducedMotion()) {
      el.pause()
      return
    }

    let disposed = false
    let observer: IntersectionObserver | null = null

    const play = (): void => {
      if (disposed) return
      el.preload = 'auto'
      void el.play().catch(() => {
        /* autoplay refused (data saver, low power): the poster stays, and that
           is a perfectly good frame — no error state, no retry loop. */
      })
    }

    const arm = (): void => {
      if (disposed) return
      if (eager) {
        play()
        return
      }
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) play()
            else el.pause()
          }
        },
        { rootMargin: '300px 0px' }
      )
      observer.observe(el)
    }

    if (waitForLoad && document.readyState !== 'complete') {
      window.addEventListener('load', arm, { once: true })
    } else {
      arm()
    }

    return () => {
      disposed = true
      observer?.disconnect()
      window.removeEventListener('load', arm)
      el.pause()
    }
  }, [eager, waitForLoad])

  /** A dead poster is a black box. Swap to the second choice when we have one. */
  const handleError = (): void => {
    const el = ref.current
    if (!el || !fallbackPoster || el.poster === fallbackPoster) return
    el.poster = fallbackPoster
  }

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      aria-hidden="true"
      tabIndex={-1}
      onError={handleError}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      <source src={src} type="video/mp4" />
    </video>
  )
}
