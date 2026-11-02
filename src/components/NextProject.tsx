/**
 * NextProject — the transition out of a case study (SITE P5).
 *
 * A full-width 21:9 framed still with the next project's poster.
 * Caption row below: "Next — NOVA spatial computing →" using the brand name from projects.ts.
 * Video plays on hover/focus (poster first).
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { VideoFrame } from './VideoFrame'
import type { Project } from '../data/projects'

interface NextProjectProps {
  project: Project
}

export const NextProject = ({ project }: NextProjectProps) => {
  const [armed, setArmed] = useState(false)
  const [posterOk, setPosterOk] = useState(true)

  const poster = posterOk ? project.media.loopPoster : project.media.heroPoster

  return (
    <Link
      to={`/work/${project.slug}`}
      viewTransition
      className="next-project"
      data-brand={project.brand.toLowerCase()}
      onPointerEnter={() => setArmed(true)}
      onPointerLeave={() => setArmed(false)}
      onFocus={() => setArmed(true)}
      onBlur={() => setArmed(false)}
      aria-label={`Next project: ${project.title}`}
    >
      <div className="next-project__frame frame frame--mat" aria-hidden="true">
        {armed ? (
          <VideoFrame
            className="next-project__video frame__media"
            src={project.media.loop}
            poster={poster}
            fallbackPoster={project.media.heroPoster}
            eager
          />
        ) : (
          <img
            className="next-project__poster frame__media"
            src={poster}
            alt=""
            onError={() => setPosterOk(false)}
          />
        )}
        <div className="frame__caption">
          <h2 className="frame__caption__title next-project__caption-title">
            Next \u2014 {project.display.lead} {project.display.tail} \u2192
          </h2>
        </div>
      </div>
    </Link>
  )
}
