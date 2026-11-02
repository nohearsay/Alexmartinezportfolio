/** 
 * CaseStudyRoute — /work/:brand, and nothing else.
 *
 * It resolves the :brand parameter (which is actually a slug like "flesh-and-blood")
 * and hands a real BrandName to CaseStudyPage. Routes are lower-case slugs;
 * the brand data keys are upper-case, so we look up by slug, not by normalizing.
 *
 * SITE P4 rebuilt the unknown-brand branch: it was old Tailwind markup with an
 * `--color-primary` link and a 16 px `text-4xl font-bold` h1. It is now the same
 * composed not-found state the 404 route uses — `.page` + `.section` so its
 * padding-top is --section-y (96/64) like every other page, a real h1 at
 * --fs-h1 (72/36), one line of copy, and a link back to /work.
 */
import { Link, useParams } from 'react-router-dom'
import { CaseStudyPage } from './CaseStudy'
import { projectBySlug } from '../data/projects'
import type { BrandName } from '../data/projects'

export const CaseStudy = () => {
  const { brand } = useParams<{ brand: string }>()

  // The :brand param is a slug (e.g., "flesh-and-blood"), not a brand name.
  // Look up by slug to get the correct BrandName.
  const project = projectBySlug(brand ?? '')
  const known = !!project

  if (!known) {
    return (
      <div className="page">
        <section className="section" aria-labelledby="brand-missing-title">
          <div className="shell">
            <div className="notfound">
              <p className="eyebrow">Case study</p>
              <h1 id="brand-missing-title">That case study does not exist</h1>
              <p className="lede">
                AURA, NOVA and Flesh and Blood Venezuela are the brands on this site - this route is none of them.
              </p>
              <div className="notfound__actions">
                <Link to="/work" viewTransition className="btn">
                  ← All work
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return <CaseStudyPage brand={project.brand as BrandName} />
}
