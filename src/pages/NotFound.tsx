/**
 * NotFound — the 404 route.
 *
 * SITE P4 rebuilt it from the token layer: one h1 at --fs-h1 (72/36), one line
 * of copy, two button-styled ways out and a short index of routes. The huge
 * "404" that used to float above the heading was set with
 * `fontVariationSettings: "wght" 800, "wdth" 125` in an inline style and a
 * `clamp(8rem, 25vw, 18rem)` font size — both break the P4 rules (weight cap
 * 700, sizes must be one of the twelve steps), so the numeral is now a plain
 * `.eyebrow` kicker and the heading carries the page.
 *
 * Everything is inside `.page` + `.section`, so the route's padding-top is
 * --section-y (96/64) like every other page.
 */
import { Link } from 'react-router-dom'

const QUICK_LINKS = [
  { label: 'Work', to: '/work' },
  { label: 'About', to: '/about' },
  { label: 'CV', to: '/cv' },
  { label: 'Contact', to: '/contact' },
  { label: 'Film & Post', to: '/film' },
  { label: 'Narrative', to: '/narrative' }
]

export const NotFound = () => (
  <div className="page">
    <section className="section" aria-labelledby="not-found-title">
      <div className="shell">
        <div className="notfound">
          <p className="eyebrow">404 — not found</p>
          <h1 id="not-found-title">This page moved, or never existed</h1>
          <p className="lede">
            The address you asked for is not on this site. Everything that is lives two clicks from
            here.
          </p>

          <div className="notfound__actions">
            <Link to="/" viewTransition className="btn">
              Back home
            </Link>
            <Link to="/work" viewTransition className="btn btn--ghost">
              Browse work
            </Link>
          </div>

          <ul className="tag-list">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} viewTransition className="tag">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  </div>
)
