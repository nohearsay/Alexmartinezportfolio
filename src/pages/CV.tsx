import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TypeScale } from '@components/TypeScale'
import { Card } from '@components/Card'
import { Grid } from '@components/Grid'
import { CV_PAGE, EDUCATION, EXPERIENCE, LANGUAGES } from '../data/cv'

gsap.registerPlugin(ScrollTrigger)

const formatPeriod = (period: string) => {
  // period like "Jan 2023 – Jan 2026" -> "2023 – 2026"
  const match = period.match(/–\s*(\d{4})\s*–\s*(\d{4})/)
  if (match) return `${match[1]} – ${match[2]}`
  return period
}

export const CV = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('[data-animate]'), {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="cv"
      className="section py-16 md:py-24"
      aria-labelledby="cv-title"
    >
      <div className="container mx-auto px-6">
        <header className="max-w-3xl mx-auto text-center mb-12 md:mb-16" data-animate>
          <TypeScale as="span" size="sm" weight="semibold" color="primary" className="inline-block mb-4 uppercase tracking-widest">
            CV / Résumé
          </TypeScale>
          <TypeScale as="h1" id="cv-title" size="5xl" weight="bold" className="mb-6">
            Experience & Education
          </TypeScale>
          <TypeScale as="p" size="lg" color="muted" className="max-w-2xl mx-auto leading-relaxed">
            {CV_PAGE.lede}
          </TypeScale>
        </header>

        {/* Experience — text-index rows */}
        <div className="max-w-3xl mx-auto" data-animate>
          <TypeScale as="h2" size="2xl" weight="bold" className="mb-8 pb-4 border-b border-[var(--line)]" style={{ borderColor: 'var(--line)' }}>
            Experience
          </TypeScale>
          <div className="space-y-6">
            {EXPERIENCE.map((job) => (
              <div key={`${job.company}-${job.role}`} className="cv-exp-row group" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '16px' }}>
                <span className="mono 12" style={{ color: 'var(--fg-faint)' }}>
                  {formatPeriod(job.period)}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <TypeScale as="h3" size="xl" weight="semibold" className="mb-1">
                    {job.role}
                  </TypeScale>
                  <div style={{ color: 'var(--fg-muted)', fontSize: '0.875rem' }}>
                    {job.company}
                  </div>
                </div>
                <span className="mono 12" style={{ color: 'var(--fg-faint)', textAlign: 'right' }}>
                  {job.location}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mt-12 md:mt-16" data-animate>
          <TypeScale as="h2" size="2xl" weight="bold" className="mb-8 pb-4 border-b border-[var(--line)]" style={{ borderColor: 'var(--line)' }}>
            Education
          </TypeScale>
          <Grid columns={{ base: 1, md: 2 }} gap="lg">
            {EDUCATION.map((edu) => (
              <Card key={edu.degree} variant="glass" padding="lg" style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '8px',
                padding: '16px',
                borderRadius: '8px',
                background: 'var(--bg-elev)',
                border: '1px solid var(--line)',
              }}>
                <TypeScale as="h3" size="lg" weight="semibold" className="mb-2">
                  {edu.degree}
                </TypeScale>
                {edu.year ? (
                  <TypeScale as="p" size="sm" color="muted">
                    {edu.year}
                  </TypeScale>
                ) : null}
                <TypeScale as="p" size="base" weight="medium" color="muted" className="mb-1">
                  {edu.school}
                </TypeScale>
              </Card>
            ))}
          </Grid>
        </div>

        {/* Languages — the only levels any of the CVs states */}
        <div className="mt-12 md:mt-16" data-animate>
          <TypeScale as="h2" size="2xl" weight="bold" className="mb-8 pb-4 border-b border-[var(--line)]" style={{ borderColor: 'var(--line)' }}>
            Languages
          </TypeScale>
          <ul className="space-y-3">
            {LANGUAGES.map((language) => (
              <li key={language.name} className="text-base" style={{ color: 'var(--fg-muted)' }}>
                {language.name} — {language.level}
              </li>
            ))}
          </ul>
        </div>

        {/* Download CTA */}
        <div className="mt-12 md:mt-16 text-center" data-animate>
          <Card variant="glass" padding="lg" className="max-w-md mx-auto" style={{
            padding: '24px',
            maxWidth: '240px',
            margin: '0 auto',
            background: 'var(--bg-elev)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
          }}>
            <TypeScale as="h3" size="lg" weight="semibold" className="mb-4">
              Full Résumé (PDF)
            </TypeScale>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--primary)' }}
            >
              Download PDF (Coming Soon)
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </Card>
        </div>
      </div>
    </section>
  )
}
