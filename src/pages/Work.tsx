/**
 * Work — the project index.
 *
 * Simplified to show the 3 portfolio brands directly:
 * AURA, NOVA, FLESH AND BLOOD VENEZUELA.
 * No discipline filters, no Grid/List toggle, no hover preview.
 * Each row shows index, logo, title, role, year — all from src/data/projects.ts.
 */
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { SectionHead } from '../components/SectionHead'
import { useReveals } from '../motion/useReveals'
import { PROJECTS } from '../data/projects'

export const Work = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  useReveals(rootRef)

  return (
    <div className="page" ref={rootRef}>
      <section className="section" aria-labelledby="work-title">
        <div className="shell">
          <SectionHead
            eyebrow="Work"
            as="h1"
            id="work-title"
            lines={['Three brands.', 'Public case studies.']}
            lede="Each case study is a proof of concept built with full creative freedom — strategy, motion system, deliverables, and results."
            exempt
          />
        </div>
        <div className="pindex" data-cv-exempt>
          <ul className="pindex__list">
            {PROJECTS.map((project, i) => (
              <li key={project.brand}>
                <Link
                  to={`/work/${project.slug}`}
                  viewTransition
                  className="pindex__row"
                >
                  <span className="pindex__thumb frame" aria-hidden="true">
                    <img
                      src={project.media.loopPoster}
                      alt=""
                      loading="eager"
                      decoding="async"
                      width={960}
                      height={540}
                    />
                  </span>
                  <span className="pindex__idx meta-label">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="pindex__title">{project.title}</h3>
                  <span className="pindex__disc">{project.role}</span>
                  <span className="pindex__year meta-label">{project.year}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
