/**
 * brandLogos.ts — THE swap point for brand artwork.
 * 
 * One entry per brand: replacing a logo is a one-line change in BRAND_LOGOS
 * below (new `src` + its intrinsic width/height). No page, card or case study
 * needs touching. That is why SITE_P2's NOVA placeholder could be replaced by
 * SITE_P2b without a single edit outside this table.
 * 
 * The shipped PNGs are Alex's locked artwork exported straight out of his .ai
 * sources — rendered at 3x on a transparent background and trimmed of empty
 * margin, never redrawn and never recoloured. Provenance (source path, page and
 * the exact export command) lives in
 * _archive/site_p2_20261028/logos_src_v2/make_logos.py.
 */

export type BrandName = 'AURA' | 'NOVA' | 'FLESH AND BLOOD VENEZUELA'

export interface BrandLogoSpec {
  /** shipped web asset */
  src: string
  /** intrinsic size of that asset, in px */
  width: number
  height: number
  /** 
   * AURA and NOVA are drawn in dark ink for a light page, so on the dark theme
   * the art sits on a subtle light plate (.brand-logo in index.css, which drops
   * the plate again in the light theme so only Alex's art is visible). 
   */

  plate: boolean
  alt: string
  /** where the asset came from, for provenance */
  source: string
}

export const BRAND_LOGOS: Record<BrandName, BrandLogoSpec> = {
  AURA: {
    src: '/media/aura/aura-logo.png',
    width: 468,
    height: 755,
    plate: true,
    alt: 'AURA — Wellness App logo',
    source: 'C:/Users/alexm/OneDrive/Documents/portfolio/aura/aura logo.ai (page 0 of 2)'
  },
  NOVA: {
    src: '/logos/nova.png',
    width: 1037,
    height: 841,
    plate: true,
    alt: 'NOVA — Spatial Computing logo',
    source: 'C:/Users/alexm/OneDrive/Documents/portfolio/nova/nova.ai'
  },
  'FLESH AND BLOOD VENEZUELA': {
    src: '/media/fab/fab-logo.png',
    width: 500,
    height: 800,
    plate: true,
    alt: 'Flesh and Blood Venezuela logo',
    source: 'C:/Users/alexm/OneDrive/Documents/FAB/out/flesh intro sound.mp4 (poster frame)'
  }
}
