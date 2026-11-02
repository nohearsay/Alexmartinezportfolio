/**
 * Home — the showreel page.
 *
 * SITE P4 rebuild. The old page leaned on a `.display display--lg` pair of
 * classes that no longer exist and on ad-hoc Tailwind spacing; this one is built
 * from the token layer only:
 *
 *  · one h1 for the route, and it is the hero's (--fs-display, 96/48);
 *  · every other section heading is a real h2 through SectionHead (--fs-h2,
 *    48/30), kickers are <p class="eyebrow">;
 *  · every section is `.section`, so its padding-top is --section-y (96/64) —
 *    which is what the P4 verifier asserts for `main section`;
 *  · the manifesto section sits straight after the work rail: HOME.manifesto
 *    from src/data/cv.ts at --fs-h2 / max-width 680px, its words fading
 *    30% -> 100% one at a time as the block enters the viewport;
 *  · NEW: Experience and CV sections added for prominence on the main page;
 *
 * Order on the page: hero, approach, work rail, manifesto, experience, cv, about, contact.
 *
 * SITE P6: Home hero points to AURA hero video; SITE P5 copy replaces
 * "Zero NDAs" with "Public case studies"; manifesto reads from CV; Frames
 * section removed per feedback — mixed stills had no context and broke layout.
 */
import { useEffect, useRef } from 'react'
import { ShowreelHero } from '../components/ShowreelHero'
import { WorkRail } from '../components/WorkRail'
import { SectionHead } from '../components/SectionHead'
import { About } from '../components/About'
import { Contact } from '../components/Contact'
import { useReveals } from '../motion/useReveals'
import { prefersReducedMotion } from '../motion/motion'
import { HOME, EXPERIENCE, POSITIONING, TOOLKIT } from '../data/cv'

/**
 * The manifesto line is HOME.manifesto from src/data/cv.ts; it is split into
 * one span per word so the lit-up reveal still works. SITE P5: two-tone — the
 * first sentence stays #FFF, everything after it drops to #8A8A8A.
 */
const MANIFESTO_SPLIT = HOME.manifesto.indexOf('. ')
const MANIFESTO_WORDS = (
  MANIFESTO_SPLIT === -1 ? HOME.manifesto : HOME.manifesto.slice(0, MANIFESTO_SPLIT + 1)
).split(' ')
const MANIFESTO_REST = MANIFESTO_SPLIT === -1 ? [] : HOME.manifesto.slice(MANIFESTO_SPLIT + 2).split(' ')

/**
 * Manifesto — one word lights at a time.
 *
 * An IntersectionObserver, not a scroll listener: the block is observed once at
 * 30% visibility, then each word is handed an --fs-h2-sized opacity transition
 * with a 90ms step. Under reduced motion every word is lit immediately, which
 * is also the state a reader with JS broken sees (the words rest at 30%
 * opacity in CSS, so the copy is always legible).
 */
const Manifesto = () => {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const words = Array.from(el.querySelectorAll<HTMLElement>('.manifesto__word'))
    if (words.length === 0) return

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      words.forEach((word) => word.classList.add('is-lit'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          words.forEach((word, i) => {
            word.style.transitionDelay = `${i * 90}ms`
            word.classList.add('is-lit')
          })
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="section" aria-labelledby="manifesto-title">
      <div className="shell">
        <div className="manifesto">
          <p className="eyebrow reveal">03 — Manifesto</p>
          <h2 id="manifesto-title" className="manifesto__title">
            {MANIFESTO_WORDS.map((word, i) => (
              <span className="manifesto__word" key={`${word}-${i}`}>
                {word}
                {i < MANIFESTO_WORDS.length - 1 || MANIFESTO_REST.length > 0 ? ' ' : null}
              </span>
            ))}
            {MANIFESTO_REST.map((word, i) => (
              <span className="manifesto__word manifesto__word--mute" key={`rest-${word}-${i}`}>
                {word}
                {i < MANIFESTO_REST.length - 1 ? ' ' : null}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  )
}

/**
 * Experience — one role card at a time, revealed on scroll.
 *
 * Each role from EXPERIENCE displays the role title, company+period, and the
 * first highlight. A "View full highlights" link is available if needed.
 */
const Experience = () => {
  return (
    <section className="section" aria-labelledby="experience-title">
      <div className="shell">
        <h2 id="experience-title" className="fs-h2 reveal">
          Experience
        </h2>
        <div className="experience__grid">
          {EXPERIENCE.map((role: { role: string; period: string; highlights: string[] }, i: number) => (
            <div className="experience__card reveal" key={i}>
              <div className="experience__meta">
                <span className="experience__role">{role.role}</span>
                <span className="experience__period">{role.period}</span>
              </div>
              <p className="experience__desc">
                {role.highlights[0]}
              </p>
              <a href="#" className="experience__more meta-link">
                View full highlights
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * CV — shows the identity headline and toolkit summary.
 *
 * Displays the hero tagline from IDENTITY, the lede summary, and the toolkit
 * tags derived from cv.ts TOOLKIT data.
 */
const CvSection = () => {
  return (
    <section className="section" aria-labelledby="cv-title">
      <div className="shell">
        <h2 id="cv-title" className="fs-h2 reveal">
          CV
        </h2>
        <p className="cv__lede reveal">
          {POSITIONING.heroLines[0]} — {POSITIONING.heroLines[1]}
        </p>
        <div className="cv__summary reveal">
          {POSITIONING.heroLede}
        </div>
        <ul className="cv__tags reveal">
          {TOOLKIT.map((group: { key: string; label: string }) => (
            <li key={group.key} className="cv__tag meta-link">
              {group.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export const Home = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  useReveals(rootRef)

  return (
    <div ref={rootRef}>
      {/* The route's single h1 lives in the hero. */}
      <ShowreelHero />

      {/* ----------------------------------------------------------- approach */}
      <section className="section" aria-labelledby="approach-title">
        <div className="shell">
          <p className="eyebrow reveal">01 — Approach</p>
          <div className="intro">
            <h2 id="approach-title" className="reveal">
              The site you are scrolling <span className="tone-mute">is the showreel.</span>
            </h2>
            <div className="intro__col">
              <p className="lede reveal" data-cv-exempt>
                Three end-to-end brands, built from the ground up: brand system, motion language, renders and the code that plays them. Every clip on this page is a real render from the work itself, and the type is a variable font with a live width axis.
              </p>
              <p className="lede reveal">{HOME.craftLine}</p>
            </div>
          </div>
        </div>

        {/* SITE P5: the marquee read as filler. It is one static mono line now;
            the words stay HOME.capabilities verbatim, one span per word so each
            text node still traces to src/data/cv.ts. */}
        <p className="caps-line reveal">
          {HOME.capabilities.map((word, i) => (
            <span key={word}>
              <span className="caps-line__item">{word}</span>
              {i < HOME.capabilities.length - 1 ? (
                <span className="caps-line__sep" aria-hidden="true">
                  {' · '}
                </span>
              ) : null}
            </span>
          ))}
        </p>
      </section>

      {/* --------------------------------------------------------- work rail */}
      <section id="work" className="section" aria-labelledby="work-title">
        <div className="shell">
          <SectionHead
            eyebrow="02 — Selected work"
            id="work-title"
            lines={['Three brands.', 'Public case studies.']}
            lede="Each case study is a proof of concept built with full creative freedom — strategy, motion system, deliverables, and results."
            exempt
          />
        </div>
        <WorkRail />
      </section>

      {/* ---------------------------------------------------------- manifesto */}
      <Manifesto />

      {/* NEW: Experience section for prominence on main page */}
      <Experience />

      {/* NEW: CV section for prominence on main page */}
      <CvSection />

      <About />
      <Contact />
    </div>
  )
}
