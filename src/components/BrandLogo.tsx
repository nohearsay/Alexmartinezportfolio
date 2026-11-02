/**
 * BrandLogo — the one place brand artwork is wired up.
 *
 * Swapping a logo is a one-line change in BRAND_LOGOS below (new `src` + its
 * intrinsic width/height); no page, card or case study needs touching. That is
 * why NOVA's placeholder from SITE_P2 could be replaced by SITE_P2b without a
 * single edit outside this table.
 *
 * The shipped PNGs are Alex's locked artwork exported straight out of his .ai
 * sources — rendered at 3x on a transparent background and trimmed of empty
 * margin, never redrawn and never recoloured. Provenance and the exact export
 * command live in _archive/site_p2_20261028/logos_src_v2/make_logos.py.
 */

import type { BrandName } from './brandLogos'
import { BRAND_LOGOS } from './brandLogos'

interface BrandLogoProps {
  brand: BrandName
  /** 'card' = project tile / grid card, 'hero' = case-study hero, 'mark' = brand-mark display, 'caption' = 24px caption row logo */
  size?: 'card' | 'hero' | 'mark' | 'caption'
  className?: string
  /** true when the brand name is already announced next to the logo */
  decorative?: boolean
}

export const BrandLogo = ({ brand, size = 'card', className = '', decorative = false }: BrandLogoProps) => {
  const spec = BRAND_LOGOS[brand]

  return (
    <span className={`brand-logo brand-logo--${size} ${className}`.trim()} data-plate={spec.plate ? 'on' : 'off'}>
      <img
        src={spec.src}
        width={spec.width}
        height={spec.height}
        alt={decorative ? '' : spec.alt}
        draggable={false}
        loading="lazy"
        decoding="async"
      />
    </span>
  )
}