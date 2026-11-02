/**
 * KineticHeading — oversized editorial type with a per-letter reveal and a live
 * variable-font axis animation. This is the piece that makes the page move like
 * the reel does.
 *
 * Structure: every line is a .k-line with overflow hidden, every word a
 * .k-word (so words never break mid-letter), every glyph a .k-char that the
 * timeline lifts from below the mask. The space BETWEEN words is a real text
 * node inside the line (not a trailing space inside a .k-word, which the line
 * boxes trim) — that is what SITE P4 fixed: the headings used to read
 * "SELECTEDWORK" and "THREEBRANDS" in innerText and on screen.
 *
 * Accessibility: the glyph spans are aria-hidden and the heading carries the
 * plain text as its label, so a screen reader hears "AURA Wellness App" rather
 * than spelling it out letter by letter.
 *
 * Reduced motion: no tween is created, and the heading renders at exactly the
 * end state (fully visible, final axis values).
 *
 * Weight: the axis animation tops out at 700. SITE P4 caps the site at 700 so
 * no heading is heavier than the display face's real bold.
 */
import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, siteEase } from '../motion/motion'

interface KineticHeadingProps {
  /** one entry per rendered line */
  lines: string[]
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  className?: string
  /** seconds to wait before the reveal starts */
  delay?: number
  /** animate wght/wdth with scroll after the intro has finished */
  scrub?: boolean
  /** static axis values when motion is off */
  restAxes?: { wght: number; wdth: number }
}

const AXES = (wght: number, wdth: number): string =>
  `"wght" ${wght.toFixed(1)}, "wdth" ${wdth.toFixed(1)}`

export const KineticHeading = ({
  lines,
  as = 'h2',
  id,
  className = '',
  delay = 0,
  scrub = false,
  restAxes = { wght: 700, wdth: 100 }
}: KineticHeadingProps) => {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const chars = Array.from(root.querySelectorAll<HTMLElement>('.k-char'))
    if (chars.length === 0) return

    if (prefersReducedMotion()) {
      root.style.fontVariationSettings = AXES(restAxes.wght, restAxes.wdth)
      return
    }

    const ctx = gsap.context(() => {
      // The axis flourish: the type literally widens and thickens as it lands.
      const axes = { wght: 300, wdth: 62 }
      const paint = (): void => {
        root.style.fontVariationSettings = AXES(axes.wght, axes.wdth)
      }
      paint()

      const tl = gsap.timeline({ delay })

      tl.fromTo(
        chars,
        { yPercent: 118, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          ease: siteEase,
          stagger: { each: 0.028, from: 'start' }
        },
        0
      )

      tl.to(
        axes,
        {
          wght: restAxes.wght,
          wdth: restAxes.wdth,
          duration: 0.8,
          ease: siteEase,
          onUpdate: paint
        },
        0
      )

      if (scrub) {
        // Attached only once the intro has finished, so the two writers of
        // font-variation-settings never fight over the same frames.
        tl.eventCallback('onComplete', () => {
          gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom top',
              scrub: 1,
              onUpdate: (self) => {
                const p = self.progress
                root.style.fontVariationSettings = AXES(300 + p * 400, 62 + p * 76)
              }
            }
          })
        })
      }
    }, root)

    return () => ctx.revert()
  }, [delay, scrub, restAxes.wght, restAxes.wdth])

  const Tag = as

  return (
    <Tag ref={ref} id={id} className={`kinetic ${className}`.trim()} aria-label={lines.join(' ')}>
      <span aria-hidden="true">
        {lines.map((line, lineIndex) => {
          const words = line.split(' ').filter((word) => word.length > 0)
          return (
            <span className="k-line" key={`${line}-${lineIndex}`}>
              {words.map((word, wordIndex) => (
                <span key={`${word}-${wordIndex}`}>
                  <span className="k-word">
                    {Array.from(word).map((char, charIndex) => (
                      <span className="k-char" key={`${char}-${charIndex}`}>
                        {char}
                      </span>
                    ))}
                  </span>
                  {/* a real collapsed space between words: never a trailing
                      space inside .k-word, which the line box would trim */}
                  {wordIndex < words.length - 1 ? ' ' : null}
                </span>
              ))}
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
