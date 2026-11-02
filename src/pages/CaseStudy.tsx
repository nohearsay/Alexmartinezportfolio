/**
 * CaseStudyPage — the cinematic case study.
 *
 * Three motion ideas, each with a reason:
 *  - the hero is pinned for ~65% of a viewport and the loop scales out from
 *    1.14 to 1 while it holds. On a case study the hero is the work, so the page
 *    gives it a beat before it starts scrolling past;
 *  - the process section keeps its media column sticky and cross-fades the two
 *    process stills against scroll progress, so the stills read as a sequence
 *    rather than a gallery;
 *  - the narrative sections stagger in, numbered, and the credits close it.
 *
 * SITE P4 rebuilt the type layer here:
 *  · the hero h1 is the route's single h1 at --fs-h1 (72/36) through
 *    KineticHeading — the old `display--hero` class no longer exists;
 *  · every section name is a real h2 at --fs-h2 (48/30). They used to be
 *    `className="eyebrow"` on an h2, i.e. 12 px headings, which is the exact
 *    defect Alex flagged. Kickers are <p class="eyebrow"> again;
 *  · the section headings are `aria-labelledby` targets, so dropping the fake
 *    eyebrow headings did not cost the sections their accessible names;
 *  · flat backgrounds only: the old grey radial-gradient hero scrim and its
 *    flat veil are both gone (SITE P4B) — the hero copy sits on flat black and
 *    the loop is a framed 16/9 media block underneath it, so no word of ours
 *    can land on the render's own burned-in text;
 *  · every still and video is max-width:100% so nothing can push the layout
 *    wider than the document.
 *
 * No prose was invented here: every line comes from src/data/projects.ts. The
 * Metrics block carries `pending: true` in that file — it is displayed with an
 * "awaiting confirmation" flag rather than being deleted or replaced with new
 * numbers (STATUS: needs Alex confirmation).
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { KineticHeading } from '../components/KineticHeading'
import { VideoFrame } from '../components/VideoFrame'
import { NextProject } from '../components/NextProject'
import { useReveals } from '../motion/useReveals'
import { gsap, prefersReducedMotion } from '../motion/motion'
import { nextProject, projectByBrand, type BrandName } from '../data/projects'

interface CaseStudyPageProps {
  brand: BrandName
}

export const CaseStudyPage = ({ brand }: CaseStudyPageProps) => {
  const project = projectByBrand(brand)
  const next = nextProject(brand)
  const rootRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const processRef = useRef<HTMLElement>(null)
  const indexRef = useRef<HTMLElement>(null)
  const [activeSection, setActiveSection] = useState<string>('cs-brief')
  const [activeStill, setActiveStill] = useState<number>(0)

  useReveals(rootRef)

  // Scroll choreography + sticky index IntersectionObserver
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (prefersReducedMotion()) return

    const mm = gsap.matchMedia()

    // --- pinned cinematic hero (desktop/tablet only)
    mm.add('(min-width: 768px)', () => {
      const hero = heroRef.current
      const video = hero?.querySelector('.cs-hero__video')
      const inner = hero?.querySelector('.cs-hero__inner')
      if (!hero || !video || !inner) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=65%',
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1
        }
      })

      tl.fromTo(video, { scale: 1.14 }, { scale: 1, ease: 'none' }, 0)
      tl.to(inner, { yPercent: -8, opacity: 0.55, ease: 'none' }, 0)

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    })

    // --- process stills: sticky media column, scrubbed cross-fade
    {
      const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'))
      const stills = Array.from(root.querySelectorAll<HTMLElement>('[data-still]'))
      if (stills.length > 1) {
        const st = gsap.context(() => {
          const trigger = gsap.timeline({
            scrollTrigger: {
              trigger: processRef.current,
              start: 'top 62%',
              end: 'bottom 78%',
              scrub: true,
              onUpdate: (self) => {
                const index = Math.min(stills.length - 1, Math.floor(self.progress * stills.length))
                stills.forEach((el, i) => el.classList.toggle('is-active', i === index))
                steps.forEach((el, i) => el.classList.toggle('is-current', i === index))
                setActiveStill(index)
              }
            }
          })

          return () => trigger.scrollTrigger?.kill()
        }, root)

        return () => {
          st.revert()
          mm.revert()
        }
      }
    }

    return () => mm.revert()
  }, [brand, project.gallery?.length])

  // IntersectionObserver for sticky index active state
  useEffect(() => {
    const sectionIds = ['cs-brief', 'cs-role', 'cs-process', 'cs-result', 'cs-features', 'cs-credits']

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-96px 0px -66% 0px', threshold: 0.1 }
    )

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    sections.forEach((el) => observer.observe(el))
    return () => sections.forEach((el) => observer.unobserve(el))
  }, [brand])

  const credits: Array<[string, string]> = [
    ['Brand', project.title],
    ['Year', project.year],
    ['Role', project.role],
    ['Tools', project.tools.join(' · ')],
    ['Deliverables', project.deliverables.join(' · ')],
    ['Renders', `${project.media.stills.length} process stills · 1 card loop · 1 cinematic hero`]
  ]

  const indexItems = [
    { id: 'cs-brief', label: 'Brief' },
    { id: 'cs-role', label: 'Role & tools' },
    { id: 'cs-process', label: 'Process' },
    { id: 'cs-result', label: 'Result' },
    ...(project.features?.length ? [{ id: 'cs-features', label: 'Feature breakdown' }] : []),
    { id: 'cs-credits', label: 'Credits' }
  ]

  // Bucket sections by title into the four scan sections
  const briefSections = project.sections.filter((s) => ['Brief', 'Problem', 'Constraint'].includes(s.title))
  const roleSections = project.sections.filter((s) => ['Role & tools', 'Role'].includes(s.title))
  const processSections = project.sections.filter((s) => ['Process', 'Decision'].includes(s.title))
  const resultSections = project.sections.filter((s) => ['Result', 'Metrics'].includes(s.title))

  const renderSectionItems = (items: typeof project.sections, sectionHeading: string) =>
    items.map((section, i) => (
      <div key={i} className="cs-subsection">
        {section.title !== sectionHeading && <h3>{section.title}</h3>}
        <p className="reveal">{section.content || ''}</p>
      </div>
    ))

  return (
    <div className="page" data-brand={project.brand.toLowerCase()} ref={rootRef}>
      {/* ------------------------------------------------------ cinematic hero */}
      <section className="cs-hero" ref={heroRef} aria-labelledby="cs-title">
        <div className="shell cs-hero__inner">
          <p className="eyebrow reveal">
            {project.brand} — case study {project.year}
          </p>

          <span className="cs-hero__logo reveal">
            <BrandLogo brand={project.brand} size="hero" decorative />
          </span>

          <KineticHeading
            as="h1"
            id="cs-title"
            className="fs-h1"
            lines={[project.display.lead, project.display.tail.toLowerCase()]}
            delay={0.06}
          />

          <div className="cs-hero__foot">
            <p className="lede reveal">{project.tagline}</p>
            <dl className="cs-hero__meta reveal">
              <div>
                <dt className="meta-label">Role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt className="meta-label">Disciplines</dt>
                <dd>{project.tags.join(' · ')}</dd>
              </div>
              <div>
                <dt className="meta-label">Year</dt>
                <dd>{project.year}</dd>
              </div>
              {project.tools.length > 0 && (
                <div>
                  <dt className="meta-label">Tools</dt>
                  <dd>{project.tools.join(' · ')}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="shell cs-hero__media reveal">
          <div className="frame frame--mat cs-hero__frame">
            <VideoFrame
              className="cs-hero__video frame__media"
              src={project.media.hero}
              poster={project.media.heroPoster}
              waitForLoad
            />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- essay body */}
      <div className="cs-essay">
        {/* Sticky section index */}
        <nav className="cs-index" ref={indexRef} aria-label="Case study sections">
          <ol className="cs-index__list">
            {indexItems.map((item) => (
              <li key={item.id} className="cs-index__item">
                <a
                  href={`#${item.id}`}
                  className={`cs-index__link ${activeSection === item.id ? 'is-active' : ''}`}
                  aria-current={activeSection === item.id ? 'true' : 'false'}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Content column */}
        <div className="cs-content">
          {/* ------------------------------------------------------------- brief */}
          <section id="cs-brief" className="section" aria-labelledby="cs-brief-title">
            <div className="shell">
              <h2 id="cs-brief-title" className="fs-h2 __lede reveal">
                {project.summary}
              </h2>
              {renderSectionItems(briefSections, 'Brief')}
              <p className="prose reveal">{project.description}</p>
            </div>
          </section>

          {/* ------------------------------------------------------------- role & tools */}
          <section id="cs-role" className="section" aria-labelledby="cs-role-title">
            <div className="shell">
              <h2 id="cs-role-title" className="fs-h2 reveal">
                Role & tools
              </h2>
              {renderSectionItems(roleSections, 'Role & tools')}
              <div className="meta-grid reveal">
                <div>
                  <h3>Tools</h3>
                  <ul className="tag-list">
                    {project.tools.map((tool) => (
                      <li className="tag" key={tool}>{tool}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Deliverables</h3>
                  <ul className="dot-list">
                    {project.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------- process */}
          <section id="cs-process" className="section cs-process" ref={processRef} aria-labelledby="cs-process-title">
            <div className="shell">
              <h2 id="cs-process-title" className="fs-h2 reveal">
                Process
              </h2>
              {renderSectionItems(processSections, 'Process')}
              <div className="cs-process__grid">
                <div className="cs-process__stage reveal">
                  {project.media.stills.map((still, i) => (
                    <img
                      className={`cs-process__still ${i === activeStill ? 'is-active' : ''}`.trim()}
                      data-still={i}
                      key={still.src}
                      src={still.src}
                      alt={`${project.display.lead} — ${still.caption}`}
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                  <div className="cs-rail">
                    {project.media.stills.map((still, i) => (
                      <button
                        key={i}
                        className="cs-rail__btn"
                        aria-label={still.caption}
                        aria-pressed={i === activeStill}
                        onClick={() => setActiveStill(i)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setActiveStill(i)
                          }
                        }}
                      >
                        <img
                          loading="lazy"
                          src={still.src}
                          alt={still.caption}
                          style={{ objectFit: 'cover', display: 'block', width: '100%', height: '100%' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <ol className="cs-process__steps">
                  {project.media.stills.map((still, i) => (
                    <li className="cs-step reveal" data-step={i} key={`${still.scene}-step`}>
                      <span className="mono cs-step__idx">{still.caption}</span>
                      <h3 className="cs-step__title">{still.scene}</h3>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------- result */}
          <section id="cs-result" className="section" aria-labelledby="cs-result-title">
            <div className="shell">
              <h2 id="cs-result-title" className="fs-h2 reveal">
                Result
              </h2>
              {renderSectionItems(resultSections, 'Result')}
              {project.gallery && project.gallery.length > 0 && (
                <div className="cs-gallery" style={{ marginTop: 'var(--space-8)' }}>
                  {project.gallery.map((item, i) => (
                    <figure key={i} className={item.wide ? 'is-wide' : ''}>
                      {item.kind === 'image' ? (
                        <img
                          src={item.srcSm || item.src}
                          srcSet={item.srcSm && item.smW ? `${item.srcSm} ${item.smW}w, ${item.src} ${item.w}w` : item.srcSm ? `${item.srcSm} 960w, ${item.src} 1200w` : ''}
                          sizes="(max-width: 700px) 100vw, 50vw"
                          width={item.w}
                          height={item.h}
                          loading="lazy"
                          decoding="async"
                          alt={`${project.display.lead} - ${item.caption}`}
                        />
                      ) : (
                        <video
                          src={item.src}
                          poster={item.poster}
                          muted
                          playsInline
                          loop
                          controls
                          preload="none"
                          width={item.w}
                          height={item.h}
                          ref={(el) => { if (el) el.muted = true }}
                        />
                      )}
                      <figcaption className="mono">{item.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ------------------------------------------------------------- feature breakdown */}
          {project.features && project.features.length > 0 && (
            <section id="cs-features" className="section" aria-labelledby="cs-features-title">
              <div className="shell">
                <h2 id="cs-features-title" className="fs-h2 reveal">
                  Feature breakdown
                </h2>
                <div className="cs-features" style={{ marginTop: 'var(--space-8)' }}>
                  {project.features.map((item, i) => (
                    <figure key={i} className={item.wide ? 'is-wide' : ''}>
                      <img
                        src={item.srcSm || item.src}
                        srcSet={item.srcSm && item.smW ? `${item.srcSm} ${item.smW}w, ${item.src} ${item.w}w` : item.srcSm ? `${item.srcSm} 960w, ${item.src} 1200w` : ''}
                        sizes="(max-width: 700px) 100vw, 50vw"
                        width={item.w}
                        height={item.h}
                        loading="eager"
                        decoding="async"
                        alt={`${project.display.lead} - ${item.caption}`}
                      />
                      <figcaption className="mono">{item.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------- credits */}
          <section id="cs-credits" className="section" aria-labelledby="cs-credits-title">
            <div className="shell">
              <h2 id="cs-credits-title" className="fs-h2 reveal">
                Credits
              </h2>
              <dl className="credits reveal">
                {credits.map(([label, value]) => (
                  <div className="credits__row" key={label}>
                    <dt className="meta-label">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="cs-actions reveal">
                <Link to="/work" viewTransition className="btn btn--ghost">
                  ← All work
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      <NextProject project={next} />
    </div>
  )
}
