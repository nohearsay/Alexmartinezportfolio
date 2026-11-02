/**
 * WorkCard — one brand tile using the shared frame system (SITE P5 R4/R8).
 *
 * The first (featured) card spans full width at 16:9; the pair sit at 16:10.
 * Captions sit below the frame per R4: logo 24 · title h3 · one-line outcome
 * (the projects.ts summary, clamped to two lines) · mono meta 'Motion · YYYY'.
 * No overlays on the media, so a text box can never sit on a render.
 *
 * The video is only mounted once the card has been hovered or focused (or
 * tapped, on touch), so opening a page with three cards downloads three small
 * posters instead of three mp4s. `data-playing` is what makes a *tap* on touch
 * devices work, where :hover never fires. A poster that 404s falls back to the
 * brand's cinematic hero poster, so there is always a frame behind the caption.
 *
 * Bright/white renders (AURA, NOVA) keep their light logo plate in the caption
 * row — the media frame itself stays dark via .work-card__media.
 *
 * SITE P6 T2: For coarse pointers (no hover) and prefers-reduced-motion, do NOT
 * mount the video on tap — poster only.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import { VideoFrame } from './VideoFrame'
import { prefersReducedMotion } from '../motion/motion'
import type { Project } from '../data/projects'

interface WorkCardProps {
  project: Project
  index: number
  /** true for the first card (full-width 16:9), false for the pair (16:10) */
  featured?: boolean
}

const hasFinePointer = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

const hasHover = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

export const WorkCard = ({ project, index, featured = false }: WorkCardProps) => {
  const [armed, setArmed] = useState(false)
  const [posterOk, setPosterOk] = useState(true)
  const [canPlayVideo, setCanPlayVideo] = useState(true)

  // Determine if video should play: fine pointer + hover capability + no reduced motion
  useEffect(() => {
    const check = () => {
      const reduced = prefersReducedMotion()
      const fine = hasFinePointer()
      const hover = hasHover()
      setCanPlayVideo(!reduced && fine && hover)
    }
    check()
    const mqlReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqlFine = window.matchMedia('(pointer: fine)')
    const mqlHover = window.matchMedia('(hover: hover)')
    mqlReduced.addEventListener('change', check)
    mqlFine.addEventListener('change', check)
    mqlHover.addEventListener('change', check)
    return () => {
      mqlReduced.removeEventListener('change', check)
      mqlFine.removeEventListener('change', check)
      mqlHover.removeEventListener('change', check)
    }
  }, [])

  const arm = (): void => {
    if (canPlayVideo) setArmed(true)
  }
  const disarm = (): void => setArmed(false)

  const poster = posterOk ? project.media.loopPoster : project.media.heroPoster

  return (
    <article
      className={`work-card${featured ? ' work-card--featured' : ''}`}
      data-brand={project.brand.toLowerCase()}
      data-playing={armed ? 'true' : 'false'}
      onPointerEnter={arm}
      onPointerLeave={disarm}
      onFocus={arm}
      onBlur={disarm}
      onTouchStart={arm}
      data-magnetic
    >
      <Link
        to={`/work/${project.slug}`}
        viewTransition
        aria-label={`${project.title} — view case study`}
      >
        <div className="work-card__media">
          <img
            className="work-card__poster"
            src={poster}
            alt=""
            width={960}
            height={540}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setPosterOk(false)}
          />

          {armed && canPlayVideo ? (
            <VideoFrame
              className="work-card__video"
              src={project.media.loop}
              poster={poster}
              fallbackPoster={project.media.heroPoster}
              eager
            />
          ) : null}
        </div>

        <div className="work-card__cap">
          <div className="work-card__cap-row">
            <span className="work-card__logo">
              <BrandLogo brand={project.brand} size="mark" decorative />
            </span>
            <h3>{project.display.lead}</h3>
          </div>
          <p className="work-card__outcome">{project.summary}</p>
          <p className="meta-label">Motion · {project.year}</p>
        </div>
      </Link>
    </article>
  )
}
