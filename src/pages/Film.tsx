/** Film — the Film & Post lane.
 *
 * SITE CV: the lane's copy is LANES.film from src/data/cv.ts — the Colombeia TV
 * role and the tasks the CVs state. Stills and clips are not cleared for publication,
 * so this lane relies solely on copy. No documentary wording, and no body of work
 * is implied that is not published.
 *
 * Markup is token-only: `.page` + `.section` (padding-top --section-y, 96/64),
 * `.eyebrow` at the label step, prose list for the CV points.
 */
import { LANES } from '../data/cv'

export const Film = () => (
  <div className="page">
    <section className="section" aria-labelledby="film-title">
      <div className="shell">
        <div className="lane">
          <p className="eyebrow">Discipline lane</p>
          <h1 id="film-title">Film & Post</h1>
          <p className="lede">{LANES.film.lede}</p>
          <ul className="lane__list" role="list">
            {LANES.film.points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  </div>
)
