/**
 * WorkRail — the project index (SITE P5 step 3).
 *
 * Replaced the pinned horizontal rail with a simple project index list:
 * one row per project with index, title, discipline (project.role) and year.
 * No hover preview, no hero image — just the essential info for the 3
 * portfolio brands (AURA, NOVA, FLESH AND BLOOD VENEZUELA).
 */
import { Link } from 'react-router-dom'
import { PROJECTS } from '../data/projects'

export const WorkRail = () => {
  return (
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
  )
}
