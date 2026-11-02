/**
 * SectionHead — one section heading for the whole site: eyebrow, oversized
 * line(s) with the kinetic reveal, optional lede.
 *
 * It exists so every page opens a section the same way, and so the kinetic
 * heading is created in exactly one place. `reveal` is the class useReveals
 * drives; the heading itself is not a reveal target because KineticHeading
 * owns its own timeline (two tweens writing the same element is the bug that
 * produced the frozen-card defect on this site once already).
 *
 * SITE P4: the eyebrow is a <p>, never an h2 — h2 is reserved for section
 * headings and h3 for card titles, and every size comes from the token layer
 * instead of an ad-hoc utility class.
 */
import { KineticHeading } from './KineticHeading'

interface SectionHeadProps {
  eyebrow: string
  lines: string[]
  lede?: string
  id?: string
  as?: 'h1' | 'h2'
  /** `data-brand` value: switches --accent for this subtree */
  brand?: string
  className?: string
  /** reveal delay in seconds for the eyebrow/lede */
  delay?: number
  /** true when this head renders case-study (brand) copy: marks it data-cv-exempt */
  exempt?: boolean
}

export const SectionHead = ({
  eyebrow,
  lines,
  lede,
  id,
  as = 'h2',
  brand,
  className = '',
  delay = 0,
  exempt = false
}: SectionHeadProps) => (
  <div
    className={`section-head ${className}`.trim()}
    data-brand={brand}
    data-cv-exempt={exempt ? '' : undefined}
  >
    <p className="eyebrow reveal" style={{ transitionDelay: `${delay}s` }}>
      {eyebrow}
    </p>
    <KineticHeading
      as={as}
      id={id}
      lines={lines}
      delay={0.05 + delay}
      restAxes={{ wght: 700, wdth: 100 }}
    />
    {lede ? <p className="lede reveal">{lede}</p> : null}
  </div>
)
