/** 
 * About — the toolkit and the approach, on both / and /about. 
 * 
 * SITE CV: the toolkit is no longer a scored skills list. Every tool comes from
 * src/data/cv.ts (Alex's CVs) — no bars, no percentages, no invented levels.
 * Each TOOLKIT group keeps a heading and its hue, so the existing
 .skill[data-category] tokens still colour the chips; the `writing` group has
 * no hue token and falls back to --accent. The only levels left on the site are
 * the CV's languages. The P4 fixes stay: the heading level is a prop (h1 on /about, h2 on /) and
 * useReveals is wired to the section — without it nothing added `.is-in` and
 * /about sat at opacity 0. The GSAP bar-fill tween went with the bars.
 */
import { useRef } from 'react'
import { useReveals } from '../motion/useReveals'
import { ABOUT, TOOLKIT } from '../data/cv'

interface AboutProps {
  /** h1 on /about (the page owns its heading), h2 on / */ 
  level?: 'h1' | 'h2'
  /** section id; /about passes nothing so it does not duplicate #about twice */ 
  id?: string
}

export const About = ({ level = 'h2', id = 'about' }: AboutProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const Tag = level

  // SITE P4 run 3: the section is the reveal root on /about too. Without this,
  // nothing ever adds `.is-in` and (because html[data-motion="full"] hides
  // .reveal) the whole page stayed at opacity 0. Same wiring as Contact.
  useReveals(sectionRef)

  return (
    <section ref={sectionRef} id={id} className="section" aria-labelledby="about-title">
      <div className="shell">
        <div className="about__head">
          <p className="eyebrow reveal">About</p>
          <Tag id="about-title" className="reveal">
            <span className="tone-mute">{ABOUT.headingLead}</span> {ABOUT.headingAccent}
          </Tag>
          <p className="about__lede reveal">{ABOUT.lede}</p>
        </div>

        <div className="about__block">
          <h3 className="reveal">Current toolkit</h3>
          <div className="toolkit">
            {TOOLKIT.map((group) => (
              <div className="toolkit__group" key={group.key}>
                <span className="toolkit__label mono uppercase" style={{ color: '#8A8A8A', fontSize: '12px' }}>{group.label}</span>
                <ul className="toolkit__list reveal">
                  {group.items.map((item) => (
                    <li
                      key={item.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 4px 4px 0',
                        font: '16/400 #FFF',
                        lineHeight: '1.5',
                      }}
                      data-category={group.hue}
                      data-toolkit-item
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--skill-hue, var(--fg-faint))',
                          flexShrink: '0',
                        }}
                      />
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="about__block">
          <h3 className="reveal">Approach</h3>
          <div className="about__grid">
            {ABOUT.approach.map((item) => (
              <div className="about__card reveal" key={item.title}>
                <span className="card-title is-accent">{item.title}</span>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
