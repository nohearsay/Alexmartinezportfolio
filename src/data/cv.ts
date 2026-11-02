/**
 * cv.ts: the ONLY source of factual copy on the non-case-study pages.
 * Every string here is quoted from, or a direct first-person restatement of,
 * one of Alex's five CV PDFs. `src` names the CV(s). Do not add text here that
 * is not in a CV; anything the CVs lack is marked ALEX TO SUPPLY and is NOT rendered.
 *
 *   CV1 = Scriptwriter & Narrative Designer: Short-Form Drama & AI Video
 *   CV2 = CRM & Lifecycle Marketing Manager · HubSpot · Bilingual
 *   CV3 = Operations Strategy & AI Implementation Specialist
 *   CV4 = Visual Storytelling Prompt Writer
 *   CV5 = Email & SMS Lifecycle Marketing
 */
export type CvId = 'CV1' | 'CV2' | 'CV3' | 'CV4' | 'CV5'

/** Existing toolkit hue tokens (index.css .skill[data-category]); 'writing' falls back to var(--accent). */
export type ToolHue = 'motion' | 'design' | 'tools' | 'code' | 'writing'

export interface Tool {
  name: string
  src: CvId[]
  /** only when a CV states a level, in the CV's own words */
  level?: string
}
export interface ToolGroup {
  key: string
  label: string
  hue: ToolHue
  items: Tool[]
}

export const IDENTITY = {
  name: 'Alexis Martínez',
  location: 'Caracas, Venezuela (UTC−4)',
  // ALEX TO CONFIRM: publishing the email on the site (it is on every CV).
  email: 'Alexmartinezedition@gmail.com',
  linkedin: 'linkedin.com/in/alex-martinez-408389a0',
  linkedinUrl: 'https://www.linkedin.com/in/alex-martinez-408389a0'
} as const

/** Hero / meta / footer positioning. Headline wording: ALEX TO APPROVE (phrases from CV4 + CV1). */
export const POSITIONING = {
  eyebrow: 'Alexis Martínez · Caracas, Venezuela (UTC−4)',
  heroLines: ['Visual storytelling', 'and AI workflows'], // CV4 "visual storytelling", CV1 "AI workflow"
  heroLede:
    'A cinematography degree, 8 years directing post-production at a national broadcast network, and hands-on AI workflow experience.', // CV1 summary
  metaTitle: 'Alexis Martínez · Visual Storytelling & AI Workflows',
  footerLede: 'Cinematographer and visual narrative specialist. Caracas, Venezuela (UTC−4).' // CV4
} as const

export const TOOLKIT: ToolGroup[] = [
  {
    key: 'video',
    label: 'Video & Post',
    hue: 'motion',
    items: [
      { name: 'Adobe Premiere Pro', src: ['CV1', 'CV3', 'CV4'] },
      { name: 'After Effects', src: ['CV1', 'CV3', 'CV4'] },
      { name: 'Motion Graphics', src: ['CV1', 'CV3', 'CV4'] },
      { name: 'VFX supervision', src: ['CV1', 'CV4'] },
      { name: 'Chroma Keying', src: ['CV3'] },
      { name: 'HD pipeline optimization', src: ['CV1', 'CV4'] }
    ]
  },
  {
    key: 'design',
    label: 'Design & Audio',
    hue: 'design',
    items: [
      { name: 'Photoshop', src: ['CV3'] },
      { name: 'Illustrator', src: ['CV3'] },
      { name: 'Audition', src: ['CV3'] },
      { name: 'Pro Tools', src: ['CV3'] }
    ]
  },
  {
    key: 'crm',
    label: 'CRM & Lifecycle',
    hue: 'tools',
    items: [
      { name: 'HubSpot', src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'] },
      { name: 'HubSpot SMS', src: ['CV5'] },
      { name: 'Klaviyo', src: ['CV5'] },
      { name: 'ActiveCampaign', src: ['CV5'] },
      { name: 'GoHighLevel', src: ['CV5'] },
      { name: 'Shopify', src: ['CV5'] }
    ]
  },
  {
    key: 'ai',
    label: 'AI & Workflow',
    hue: 'code',
    items: [
      { name: 'AI agent building', src: ['CV1', 'CV2', 'CV3', 'CV4'] },
      { name: 'Workflow integration & testing', src: ['CV2', 'CV3'] },
      { name: 'Prompt-based generation', src: ['CV4'] },
      { name: 'Client journey mapping', src: ['CV2', 'CV3'] },
      { name: 'Audience persona profiling', src: ['CV2', 'CV3'] },
      { name: 'Marketing automation', src: ['CV2'] }
    ]
  },
  {
    key: 'writing',
    label: 'Writing & Story',
    hue: 'writing',
    items: [
      { name: 'Short-drama episode scripting', src: ['CV1'] },
      { name: 'Series bible development', src: ['CV1'] },
      { name: 'Conversion copywriting', src: ['CV1', 'CV2', 'CV3', 'CV4'] },
      { name: 'Editorial review & fact-checking', src: ['CV1', 'CV4'] },
      { name: 'Technical writing & translation', src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'] }
    ]
  }
]

/** The only stated levels in any CV. Render as text, never as a bar or number. */
export const LANGUAGES: Tool[] = [
  { name: 'Spanish', level: 'Native', src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'] },
  { name: 'English', level: 'Expert, technical writing and translation', src: ['CV1', 'CV2', 'CV4', 'CV5'] }
]

/** All toolkit + language names: the DOM check's allowed list for [data-toolkit-item]. */
export const CV_TOOL_NAMES: string[] = [
  ...TOOLKIT.flatMap((g) => g.items.map((t) => t.name)),
  ...LANGUAGES.map((l) => l.name)
]

export const ABOUT = {
  headingLead: 'Cinematographer and', // CV4 summary
  headingAccent: 'visual narrative specialist',
  lede:
    'Eight years directing post-production at a national broadcast network. From 2023 to 2026, building and deploying AI agents that automated content generation and lead-nurture workflows.', // CV1, CV4
  // Card titles: ALEX TO APPROVE (derived labels); bodies are CV text.
  approach: [
    { title: 'Story first', desc: 'Hooks, cliffhangers, setup → conflict → twist → payoff.', src: ['CV1'] },
    { title: 'Pacing and rhythm', desc: 'Post-production editorial judgment: pacing, rhythm, narrative flow.', src: ['CV1', 'CV4'] },
    { title: 'Tested before handover', desc: 'End-to-end workflows, with structured testing before every client handover.', src: ['CV1', 'CV2', 'CV4'] }
  ]
} as const

export const HOME = {
  // replaces the "After Effects and Cinema 4D ... GSAP, React" paragraph
  craftLine:
    'Eight years directing post-production at a national broadcast network, supervising motion graphics and VFX in After Effects and Premiere Pro. Photoshop, Illustrator, Audition and Pro Tools sit alongside.', // CV1, CV3, CV4
  // marquee: CV terms only
  capabilities: [
    'Visual storytelling',
    'Shot composition',
    'Camera language',
    'Lighting',
    'Pacing and rhythm',
    'Motion graphics',
    'VFX supervision',
    'Vertical short-form (9:16)',
    'Scriptwriting',
    'AI agents',
    'Workflow engineering',
    'Conversion copywriting'
  ],
  // ALEX TO APPROVE: CV1 summary wording
  manifesto: 'Shot composition, pacing, editorial rhythm.'
} as const

export interface Role {
  role: string
  /** other wording of the same title in another CV: ALEX TO CHOOSE */
  altRole?: string
  company: string
  period: string
  location: string
  lane: 'Film & Post' | 'Lifecycle & Growth' | 'Ops & AI'
  highlights: string[]
  src: CvId[]
}

export const EXPERIENCE: Role[] = [
  {
    role: 'AI & Content Workflow Specialist',
    altRole: 'AI & Client Optimization Specialist',
    company: 'Pretty Okay Media',
    period: 'Jan 2023 – Jan 2026',
    location: 'Remote',
    lane: 'Ops & AI',
    src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'],
    highlights: [
      'Built and deployed AI agents that automated content generation and lead-nurture workflows.',
      'Lifted revenue a minimum of 15% across 10 e-commerce clients by rebuilding their lifecycle content and lead-nurture automation in HubSpot.',
      'Developed audience and prospect profiling models that drive personalised content creation at segment level.',
      'Engineered end-to-end content workflows and ran structured testing before every client handover.'
    ]
  },
  {
    role: 'Campaign & Acquisition Copywriter (Contract)',
    altRole: 'Campaign & Acquisition Specialist',
    company: 'Smart Trading Blueprint',
    period: 'Jan 2025 – Dec 2025',
    location: 'Remote',
    lane: 'Lifecycle & Growth',
    src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'],
    highlights: [
      'Drove a 25% lift in client acquisition by leading a full funnel optimisation and writing the conversion copy for every journey touchpoint.'
    ]
  },
  {
    role: 'Optimization Consultant & Newsletter Editor (Contract)',
    altRole: 'Optimization Consultant',
    company: 'Alcohol Free Lifestyle',
    period: 'Jan 2025 – Dec 2025',
    location: 'Remote',
    lane: 'Lifecycle & Growth',
    src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'],
    highlights: [
      'Raised closing rate 33% by designing and running a monthly newsletter campaign end to end — writing, editing, and optimising every edition.'
    ]
  },
  {
    role: 'Optimization Specialist (Contract)',
    company: 'IFCA',
    period: 'Jan 2025 – Nov 2025',
    location: 'Remote',
    lane: 'Lifecycle & Growth',
    src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'],
    highlights: [
      'Reactivated 38% of a dormant non-opener segment by building funnels and running sustained win-back campaigns.',
      'Reduced sales-pipeline friction by overhauling the CRM so the client journey ran from acquisition through retention without manual handoffs.'
    ]
  },
  {
    role: 'Assistant Project Manager',
    company: 'Wellspring Media',
    period: 'Jan 2020 – Jan 2023',
    location: 'Remote',
    lane: 'Lifecycle & Growth',
    src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'],
    highlights: [
      'Re-engaged a 2,000,000-record list through batch cleanup and reactivation, retaining ~80% as active openers at a 40% open rate.',
      'Handled webpage management and design, professional copywriting, and proofreading for all digital assets.'
    ]
  },
  {
    role: 'Editor in Chief, Programming & News',
    company: 'Colombeia TV',
    period: 'Dec 2009 – Dec 2017',
    location: 'Caracas, Venezuela',
    lane: 'Film & Post',
    src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'],
    highlights: [
      'Directed a 42-person post-production department at a national broadcaster for 8 years, delivering two 1-hour news programmes daily to a live-air deadline.',
      'Optimised HD edition pipelines and supervised motion graphics and VFX workflows, enforcing quality standards across every piece of published content.',
      'Owned end-to-end editorial quality: script review, copy editing, fact-checking, and final sign-off under tight broadcast deadlines.'
    ]
  }
]

export const EDUCATION = [
  { degree: 'Arts, major in Cinematography', school: 'Universidad Central de Venezuela, Caracas', year: '2009', src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'] },
  // year: ALEX TO SUPPLY (no CV gives one) -> render no year
  { degree: 'Bachelor’s Degree in Humanities', school: 'Unidad Educativa Escuela Comunitaria, Caracas', year: '', src: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5'] }
] as const

export const CV_PAGE = {
  lede: 'Caracas, Venezuela (UTC−4) · Spanish — native · English — expert, technical' // CV2
} as const

/** Discipline lanes: body copy for /film, /narrative and the three Work stub lanes. */
export const LANES = {
  film: {
    lede: 'Editor in Chief, Programming & News — Colombeia TV, Caracas · Dec 2009 – Dec 2017',
    points: [
      'Directed a 42-person post-production department at a national broadcaster for 8 years, delivering two 1-hour news programmes daily to a live-air deadline.',
      'Optimised HD edition pipelines and supervised motion graphics and VFX workflows, enforcing quality standards across every piece of published content.',
      'Arts, major in Cinematography — Universidad Central de Venezuela (2009)'
    ],
    src: ['CV1', 'CV3', 'CV4']
    // reels / stills: ALEX TO SUPPLY
  },
  narrative: {
    lede: 'Short-drama episode scripting: hooks, cliffhangers, setup → conflict → twist → payoff.',
    points: [
      'Character development, relationship dynamics, and series continuity.',
      'Dialogue writing for spoken delivery + clear shot direction for production.',
      'Vertical short-form format (9:16) and bingeable episode arcs.',
      'Series bible development: characters, world-building, episode outlines, hook variations.'
    ],
    src: ['CV1']
    // script samples: ALEX TO SUPPLY (CV1 itself says "To be added")
  },
  prompts: {
    lede: 'Shot types, camera language, lighting and visual pacing, translated into structured, richly detailed descriptions.',
    points: ['Experience with structured content annotation and prompt-based generation.'],
    src: ['CV4']
  },
  growth: {
    lede: 'Email and SMS lifecycle programs in HubSpot, including HubSpot SMS, plus Klaviyo, ActiveCampaign, and GoHighLevel, on Shopify.',
    points: [
      '+15% revenue across 10 e-commerce clients',
      '+25% client acquisition, funnel rebuild',
      '38% of dormant non-openers reactivated',
      '2M record list re-engaged to a 40% open rate',
      'Closing rate raised 33% with a monthly newsletter'
    ],
    src: ['CV1', 'CV2', 'CV5']
  },
  ops: {
    lede: 'AI agent building for mail marketing and lead nurturing, workflow integration & testing, HubSpot architecture, and client journey mapping.',
    points: ['Overhauled HubSpot environments to automate the client journey from initial acquisition to retention.'],
    src: ['CV3']
  }
} as const

export const CONTACT = {
  lede:
    'Available for remote work. Caracas (UTC−4) is 3–4 hours ahead of US Pacific, enabling real-time collaboration with US-based teams.', // CV1, CV4. Hours/week: ALEX TO SUPPLY (CVs say full-time, 10–40, 20, 40)
  projectTypes: [
    'Film & Post',
    'Narrative & Script',
    'Visual prompt writing',
    'Lifecycle & Growth (email, SMS, CRM)',
    'Ops & AI (agents, workflows)'
  ]
} as const
