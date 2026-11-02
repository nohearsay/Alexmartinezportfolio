/**
 * Header — the floating compact bar.
 *
 * SITE P4 restyled this into one row: the mark on the left, one row of nav
 * links in the middle, the theme toggle and (below 768px) the menu button on
 * the right. The bar is 64px tall at >=768 and 56px below, sits 12px from the
 * top, and is translucent over a blur so the work shows through it. It is the
 * header element itself, so `header` measures 56/64px — never more.
 *
 * Touch targets: every link and control here is at least 48x48 px, including
 * the wordmark and the theme toggle. That is the SITE P2 open item, closed in
 * the .nav-link / .icon-btn rules in src/index.css.
 *
 * The mobile panel is only *rendered* when it is open. Hiding an off-canvas
 * menu with a transform would leave its links measurable on screen, and a
 * 48px target rule that cannot see them cannot police them. Its links enter on
 * a 60ms stagger, capped at 400ms (--fs-menu type, one row each).
 */
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Dark is the default: only an explicit saved "light" wins, so an OS light
    // colour-scheme preference cannot change the site's first paint.
    const initial: 'light' | 'dark' = localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggle = (): void => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="icon-btn"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={theme === 'dark'}
      disabled={!mounted}
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {theme === 'light' ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        )}
      </svg>
    </button>
  )
}

const NAV_ITEMS = [
  { label: 'Work', to: '/work' },
  { label: 'Film', to: '/film' },
  { label: 'Narrative', to: '/narrative' },
  { label: 'Flesh and Blood Venezuela', to: '/work/flesh-and-blood' },
  { label: 'About', to: '/about' },
  { label: 'CV', to: '/cv' },
  { label: 'Contact', to: '/contact' }
]

/** 60ms per link, capped at 400ms — the panel never takes longer than that. */
const STAGGER_MS = 60
const STAGGER_CAP_MS = 400

export const Header = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (to: string): boolean =>
    location.pathname === to || location.pathname.startsWith(`${to}/`)

  return (
    <header className="site-header" role="banner">
      <div className={`site-header__bar${scrolled ? ' is-scrolled' : ''}`}>
        <Link to="/" viewTransition className="wordmark" aria-label="Alexis Martínez — home">
          Alexis Martínez
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul className="site-nav__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  viewTransition
                  className="nav-link"
                  aria-current={isActive(item.to) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__tools">
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="menu-panel" id="site-menu">
          <nav aria-label="Mobile">
            <ul className="menu-panel__list">
              {NAV_ITEMS.map((item, i) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    viewTransition
                    className="menu-panel__link"
                    aria-current={isActive(item.to) ? 'page' : undefined}
                    style={{ animationDelay: `${Math.min(i * STAGGER_MS, STAGGER_CAP_MS)}ms` }}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="menu-panel__foot">Brand identity · live motion renders</p>
        </div>
      ) : null}
    </header>
  )
}
