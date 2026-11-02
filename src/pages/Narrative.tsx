/** Narrative — the Narrative & Script lane.

 * SITE CV: the lane's copy is LANES.narrative from src/data/cv.ts — the CV1
 * wording for short-drama scripting — followed by the generic clearing line. No
 * treatments or storyboards are claimed.

 * Markup is composed of a sticky index, prose area, and script excerpts in mono panels.
 */
import { Link } from 'react-router-dom'
import { LANES } from '../data/cv'

export const Narrative = () => (
  <div className="page">
    <section className="section" aria-labelledby="narrative-title">
      <div className="shell">
        <div className="lane">
          <p className="eyebrow">Discipline lane</p>
          <h1 id="narrative-title">Narrative & Script</h1>
          <p className="lede">{LANES.narrative.lede}</p>
          <div className="excerpt-wrapper">
            {LANES.narrative.points.map((point, i) => (
              <div key={i} className="excerpt-panel">
                <p>{point}</p>
              </div>
            ))}
          </div>
          <p className="lede">Samples are being cleared for publication.</p>
          <Link to="/work" viewTransition className="btn btn--ghost">← All work</Link>
        </div>
      </div>
    </section>
  </div>
)
