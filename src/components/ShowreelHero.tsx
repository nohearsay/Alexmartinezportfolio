/**
 * ShowreelHero — statement + three project cards (replaces showreel video).
 *
 * SITE P5: the hero was a split with a video; P6 replaces the video with
 * three clickable project cards — one per brand (AURA, NOVA, FLESH AND BLOOD).
 * Each card uses the project's logo and links to its case study.
 */
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { KineticHeading } from './KineticHeading'
import { IDENTITY, POSITIONING } from '../data/cv'
import { PROJECTS } from '../data/projects'
import { smoothScrollTo } from '../motion/motion'

export const ShowreelHero = () => {
  const toWork = useCallback(() => smoothScrollTo('#work', -1), [])

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="shell">
        <div className="hero__top reveal">
          <p className="meta-label">{POSITIONING.eyebrow}</p>
          <p className="meta-label">
            {IDENTITY.name} · {IDENTITY.location}
          </p>
        </div>

        <div className="hero__text">
          <KineticHeading
            as="h1"
            id="hero-title"
            className="hero__title fs-display"
            lines={[...POSITIONING.heroLines]}
            delay={0.12}
            scrub
          />
          <p className="lede hero__lede reveal">{POSITIONING.heroLede}</p>
          <div className="hero__actions reveal">
            <button type="button" className="btn btn--primary" onClick={toWork}>
              View work
            </button>
            <Link to="/cv" viewTransition className="btn btn--ghost">
              CV
            </Link>
          </div>
        </div>

        {/* Three project cards replacing the showreel video */}
        <div className="hero__projects reveal" data-cv-exempt>
          <div className="hero__projects-grid">
            {PROJECTS.map((project) => (
              <Link
                key={project.brand}
                to={`/work/${project.slug}`}
                viewTransition
                className="hero__project-card frame frame--mat"
                aria-label={`${project.title} — case study`}
              >
                <img
                  src={project.media.logo}
                  alt={`${project.display.lead} logo`}
                  loading="eager"
                  decoding="async"
                  width={480}
                  height={480}
                  className="hero__project-logo frame__media"
                  style={{ objectFit: 'contain', width: '60%', height: '60%', maxWidth: '200px', maxHeight: '200px' }}
                />
                <div className="hero__project-caption frame__caption">
                  <span className="frame__caption__title">{project.display.lead}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
