/**
 * projects.ts — the single source of truth for the brand projects.
 *
 * Every screen (home rail, work grid, case studies, next-project block) reads
 * from here, so a copy change or a new render is a one-line edit. The prose is
 * the copy that was already approved for this site; P3 added the media paths,
 * the process-still captions (derived from the render file names) and the
 * credit rows (assembled from the existing role/tools/deliverables fields —
 * nothing about the work itself was invented here).
 *
 * Media files are produced by tools/make-media.sh from portfolio/motion/.
 */

export type BrandName = 'AURA' | 'NOVA' | 'FLESH AND BLOOD VENEZUELA'

export interface ProcessStill {
  src: string
  srcSm?: string
  /** scene slug taken from the motion render's own file name */
  scene: string
  caption: string
}

export interface CaseSection {
  title: string
  content: string
  /**
   * SITE P4: true when the copy is a claim that still needs Alex's confirmation
   * before it can be published as fact (currently: the Metrics block on every
   * case study, which was written in P1 and never signed off). The content is
   * still displayed — the case-study page renders it with a "Needs
   * confirmation" flag — so nothing is hidden from Alex and no new number was
   * invented to replace it.
   */
  pending?: boolean
}

export interface Project {
  brand: BrandName
  /** lower-case route slug, /work/<slug> */
  slug: string
  title: string
  /** the "AURA — Wellness App" split, for two-line display type */
  display: { lead: string; tail: string }
  tagline: string
  description: string
  /** one line for the home rail */
  summary: string
  role: string
  year: string
  tags: string[]
  tools: string[]
  deliverables: string[]
  sections: CaseSection[]
  media: {
      loop: string
      loopPoster: string
      hero: string
      heroPoster: string
      logo: string
      stills: ProcessStill[]
    }
  gallery?: Array<{ src: string; srcSm?: string; kind: 'image' | 'video'; poster?: string; caption: string; wide?: boolean; w?: number; h?: number; smW?: number }>
    features?: Array<{ src: string; srcSm?: string; caption: string; wide?: boolean; w?: number; h?: number; smW?: number }>
}

export const PROJECTS: Project[] = [
  {
    brand: 'AURA',
    slug: 'aura',
    title: 'AURA — Wellness App',
    display: { lead: 'AURA', tail: 'Wellness App' },
    tagline: 'Calm kinetic type meets glassmorphism',
    description:
      'AURA: wellness app brand identity — glassmorphic UI, vertical-first kinetic type and a unified motion system.',
    summary: 'Kinetic type, glass panels, and a 60-second breath at the centre of it.',
    role: 'Motion Designer · Web Developer',
    year: '2026',
    tags: ['Brand Motion', 'Kinetic Type', 'Glassmorphism', 'Vertical Reel'],
    tools: ['After Effects 2026', 'Cinema 4D', 'GSAP/ScrollTrigger', 'Figma', 'Adobe Firefly'],
    deliverables: [
      '15-sec muted hero loop (9:16 + 16:9)',
      '30-sec brand film with sound design',
      '12 styleframes (problem → process → result)',
      'Motion token library (.json + .mogrt)',
      'Component kit (Button, Card, Nav, TypeScale)'
    ],
    sections: [
      {
        title: 'Problem',
        content: 'Wellness apps feel clinical and cold. Users need calm, not complexity.'
      },
      {
        title: 'Constraint',
        content:
          'No existing brand assets. Build from zero in 2 weeks. Vertical-first for social.'
      },
      {
        title: 'Role',
        content: 'Solo motion designer + web dev. Strategy, animation, code, sound design.'
      },
      {
        title: 'Process',
        content:
          '1) Variable font exploration (Roboto Flex weight/width axes). 2) Glassmorphism system (frosted panels, refraction). 3) Kinetic type choreography (easing, anticipation, follow-through). 4) Vertical reel edit (Premiere auto-reframe). 5) Web implementation (GSAP ScrollTrigger + React).'
      },
      {
        title: 'Decision',
        content:
          'Chose a variable font with three live axes: weight 300→700 on scroll, width 85→125 for emphasis, and a fixed slant so the calm stays calm.'
      },
      {
        title: 'Result',
        content:
          'Hero loop: 4.2 MB WebM. Brand film: 18 MB MP4. Lighthouse 98/95/92/95. Motion tokens adopted by 3 designers.'
      },
      {
        title: 'Metrics',
        pending: true,
        content:
          'Loop playback rate 94%. Brand film completion 78%. Motion token download 200+ in week 1.'
      }
    ],
    media: {
                  loop: '/media/aura-loop.mp4',
                  loopPoster: '/media/aura/loop-poster.webp',
                  hero: '/media/aura/aura-02-9x16.mp4',
                  heroPoster: '/media/aura/aura-02-9x16-poster.jpg',
                  logo: '/media/aura/aura-logo.png',
                  stills: [
                { src: '/media/aura/frame-1.webp', srcSm: '/media/aura/frame-1-sm.webp', scene: 'breathe', caption: 'Scene 01 — Breathe' },
                { src: '/media/aura/frame-4.webp', srcSm: '/media/aura/frame-4-sm.webp', scene: 'focus', caption: 'Scene 04 — Focus' },
                { src: '/media/aura/frame-6.webp', srcSm: '/media/aura/frame-6-sm.webp', scene: 'reset', caption: 'Scene 06 — Reset' },
                { src: '/media/aura/frame-8.webp', srcSm: '/media/aura/frame-8-sm.webp', scene: 'calm', caption: 'Scene 08 — Calm' }
              ]
            },
    gallery: [
      { src: '/media/aura/aura-02-9x16.mp4', kind: 'video', poster: '/media/aura/aura-02-9x16-poster.jpg', caption: 'Aura 02 - 9:16', w: 720, h: 1280 },
      { src: '/media/aura/productivity.mp4', kind: 'video', poster: '/media/aura/productivity-poster.jpg', caption: 'Productivity', w: 1920, h: 3414 },
      { src: '/media/aura/aura-intro.mp4', kind: 'video', poster: '/media/aura/aura-intro-poster.jpg', caption: 'AURA Intro', w: 1920, h: 3414 }
    ]
  },
  {
    brand: 'NOVA',
    slug: 'nova',
    title: 'NOVA — AR glasses',
    display: { lead: 'NOVA', tail: 'AR glasses' },
    tagline: 'Wear the future.',
    description: 'Lightweight AR glasses that blend digital UI into physical space.',
    summary: 'Step into the future. Your space, enhanced.',
    role: 'Motion Graphics',
    year: '2026',
    tags: ['Brand identity', 'Motion', 'Key visuals', 'Feature breakdown'],
    tools: ['After Effects', 'Illustrator', 'Prompt-based generation'],
    deliverables: [
      'Logo (Illustrator)',
      'Logo animation: reverse shatter (After Effects)',
      'Vertical story cut',
      'Vertical product carousel',
      'Product stills',
      'Lifestyle key visuals',
      'Feature breakdown: exploded, orthographic and visor macro views'
    ],
    sections: [
      {
        title: 'Brief',
        content: 'Core promise: lightweight AR glasses that blend digital UI into physical space. Archetype: the Explorer / the Magician, pioneering breakthroughs that reshape perception. Voice: bold, visionary, precise, empowering.'
      },
      {
        title: 'Role & tools',
        content: 'Motion Graphics. After Effects for the logo animation and cuts, Illustrator for the logo, prompt-based generation for the product and lifestyle stills.'
      },
      {
        title: 'Process',
        content: "Visual language: bento-grid layouts, a variable-font hero, 3D-ish UI cards with subtle depth and glass, high-contrast dark mode by default. Type: Space Grotesk Variable, weight 300-700, width 85-115. Motion: snap-to-grid entrance, magnetic hover, layered parallax. Palette: Void #05080f / #0d1420, Electric #00f0ff / #00b8d4, Amber #ffb300."
      },
      {
        title: 'Result',
        content: 'A logo and its reverse-shatter animation, two vertical social cuts, product stills, lifestyle key visuals and a feature breakdown set.'
      }
    ],
    media: {
          loop: '/media/nova-loop.mp4',
          loopPoster: '/media/nova/loop-poster.webp',
          hero: '/media/nova/hero-shatter.mp4',
          heroPoster: '/media/nova/hero-shatter-poster.jpg',
          logo: '/media/nova/nova-logo.webp',
          stills: [
        { src: '/media/nova/nova-logo.webp', scene: 'logo', caption: 'Logo' },
        { src: '/media/nova/product-hero.webp', scene: 'product', caption: 'Hero shot' },
        { src: '/media/nova/product-case.webp', scene: 'case', caption: 'Charging case' }
      ]
    },
    gallery: [
          { src: '/media/nova/life-portrait.webp', srcSm: '/media/nova/life-portrait-sm.webp', kind: 'image', caption: 'Studio portrait', wide: true, w: 1600, h: 1280, smW: 960 },
          { src: '/media/nova/story-01.mp4', kind: 'video', poster: '/media/nova/story-01-poster.jpg', caption: 'Story 01 · vertical cut' },
          { src: '/media/nova/life-cafe.webp', srcSm: '/media/nova/life-cafe-sm.webp', kind: 'image', caption: 'Café', w: 900, h: 1600, smW: 600 },
          { src: '/media/nova/life-street.webp', srcSm: '/media/nova/life-street-sm.webp', kind: 'image', caption: 'Street', w: 900, h: 1600, smW: 600 },
          { src: '/media/nova/carousel.mp4', kind: 'video', poster: '/media/nova/carousel-poster.jpg', caption: 'Product carousel · vertical' },
          { src: '/media/nova/life-desk.webp', srcSm: '/media/nova/life-desk-sm.webp', kind: 'image', caption: 'Desk', w: 900, h: 1600, smW: 600 },
          { src: '/media/nova/life-closeup.webp', srcSm: '/media/nova/life-closeup-sm.webp', kind: 'image', caption: 'Close-up', w: 900, h: 1600, smW: 600 },
          { src: '/media/nova/product-lowkey.webp', srcSm: '/media/nova/product-lowkey-sm.webp', kind: 'image', caption: 'Low-key product', w: 900, h: 1600, smW: 600 }
        ],
        features: [
              { src: '/media/nova/feature-exploded.webp', srcSm: '/media/nova/feature-exploded-sm.webp', caption: 'Exploded technical view', w: 941, h: 1672, smW: 600 },
              { src: '/media/nova/feature-ortho.webp', srcSm: '/media/nova/feature-ortho-sm.webp', caption: 'Three orthographic views', wide: true, w: 1600, h: 640, smW: 960 },
              { src: '/media/nova/feature-visor-macro.webp', srcSm: '/media/nova/feature-visor-macro-sm.webp', caption: 'Extreme macro of the clear visor', w: 941, h: 1672, smW: 600 }
            ]
      },
      {
        brand: 'FLESH AND BLOOD VENEZUELA',
        slug: 'flesh-and-blood',
        title: 'Flesh and Blood Venezuela',
        display: { lead: 'Flesh and Blood', tail: 'Venezuela' },
        tagline: 'Venezuela\'s TCG community hub',
        description:
          'Grow and energise Venezuela\'s local Flesh and Blood (the trading card game) player community, and promote local events and tournaments.',
        summary: 'Motion promos for events; social carousels that teach new players (How to Play Sealed) and introduce heroes (Meet the Heroes); a consistent branded intro.',
        role: 'Motion Designer · Web Developer',
        year: '2026',
        tags: ['Brand Motion', 'TCG', 'Event Promos', 'Social Carousels'],
        tools: ['After Effects', 'Premiere Pro', 'GSAP', 'React', 'Framer Motion'],
        deliverables: [
          'Branded intro video (with sound, click-to-play)',
          'How to Play Sealed carousel (7 PNGs)',
          'Meet the Heroes carousel (4 PNGs)',
          'Event promotional videos (muted, controls, playsinline)',
          'Reusable event-publicity kit for the local scene'
        ],
        sections: [
          {
            title: 'Brief',
            content: 'Grow and energise Venezuela\'s local Flesh and Blood (the trading card game) player community, and promote local events and tournaments.'
          },
          {
            title: 'Process',
            content:
              'Motion promos for events; social carousels that teach new players (How to Play Sealed) and introduce heroes (Meet the Heroes); a consistent branded intro.'
          },
          {
            title: 'Result',
            content:
              'A reusable event-publicity kit for the local Flesh and Blood community.'
          }
        ],
        media: {
                                  loop: '/media/fab/fab-intro.mp4',
                                  loopPoster: '/media/fab/loop-poster.webp',
                                  hero: '/media/fab/fab-intro.mp4',
                                  heroPoster: '/media/fab/fab-intro-poster.jpg',
                                  logo: '/media/fab/fab-logo.png',
                                  stills: [
            { src: '/media/fab/how-to-play-sealed-01.png', scene: '1', caption: 'How to Play Sealed — 1' },
            { src: '/media/fab/how-to-play-sealed-02.png', scene: '2', caption: 'How to Play Sealed — 2' },
            { src: '/media/fab/how-to-play-sealed-03.png', scene: '3', caption: 'How to Play Sealed — 3' },
            { src: '/media/fab/how-to-play-sealed-04.png', scene: '4', caption: 'How to Play Sealed — 4' },
            { src: '/media/fab/how-to-play-sealed-05.png', scene: '5', caption: 'How to Play Sealed — 5' },
            { src: '/media/fab/how-to-play-sealed-06.png', scene: '6', caption: 'How to Play Sealed — 6' },
            { src: '/media/fab/how-to-play-sealed-07.png', scene: '7', caption: 'How to Play Sealed — 7' }
          ]
        },
        gallery: [
                          { src: '/media/fab/fab-intro.mp4', kind: 'video', poster: '/media/fab/fab-intro-poster.jpg', caption: 'Intro video' },
                          { src: '/media/fab/how-to-play-sealed-01.png', kind: 'image', caption: 'How to Play Sealed 1' },
                          { src: '/media/fab/how-to-play-sealed-02.png', kind: 'image', caption: 'How to Play Sealed 2' },
                          { src: '/media/fab/how-to-play-sealed-03.png', kind: 'image', caption: 'How to Play Sealed 3' },
                          { src: '/media/fab/how-to-play-sealed-04.png', kind: 'image', caption: 'How to Play Sealed 4' },
                          { src: '/media/fab/how-to-play-sealed-05.png', kind: 'image', caption: 'How to Play Sealed 5' },
                          { src: '/media/fab/how-to-play-sealed-06.png', kind: 'image', caption: 'How to Play Sealed 6' },
                          { src: '/media/fab/how-to-play-sealed-07.png', kind: 'image', caption: 'How to Play Sealed 7' },
                          { src: '/media/fab/meet-the-heroes-01.png', kind: 'image', caption: 'Meet the Heroes 1' },
                          { src: '/media/fab/meet-the-heroes-02.png', kind: 'image', caption: 'Meet the Heroes 2' },
                          { src: '/media/fab/meet-the-heroes-03.png', kind: 'image', caption: 'Meet the Heroes 3' },
                          { src: '/media/fab/meet-the-heroes-04.png', kind: 'image', caption: 'Meet the Heroes 4' }
                        ],
        features: []
      }
    ]

export const projectByBrand = (brand: BrandName): Project =>
  PROJECTS.find((p) => p.brand === brand) as Project

export const projectBySlug = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug.toLowerCase())

/** The brand that follows `brand` in the work order, wrapping around. */
export const nextProject = (brand: BrandName): Project => {
  const i = PROJECTS.findIndex((p) => p.brand === brand)
  return PROJECTS[(i + 1) % PROJECTS.length]
}

export const HERO_SHOWREEL = {
  mp4: '/media/showreel.mp4',
  webm: '/media/showreel.webm',
  poster: '/media/showreel-poster.jpg'
}
