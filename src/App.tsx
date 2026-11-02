import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Work } from './pages/Work'
import { Film } from './pages/Film'
import { Narrative } from './pages/Narrative'
// SITE P4: /about and /contact own an h1 now, so each route has exactly one.
// On the home page the same two components are sections and lead with an h2.
import { About } from './components/About'
import { CV } from './pages/CV'
import { Contact } from './components/Contact'
import { CaseStudy } from './pages/CaseStudyRoute'
import { NotFound } from './pages/NotFound'
import siteMeta from './site-meta.json'

// Titles live in src/site-meta.json so the client and the build-time shell
// generator (tools/prerender-shell.mjs) can never drift apart.
export const SITE_NAME = siteMeta.siteName

const titles = siteMeta.titles as Record<string, string>

/** Keeps document.title in step with the active route (the export is one static shell). */
const RouteTitle = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    const match = /^\/work\/([^/]+)$/.exec(clean)
    const brand = match ? match[1].toUpperCase() : null

    document.title =
      (brand ? titles[`/work/${brand.toLowerCase()}`] : undefined) ??
      titles[clean] ??
      titles['/404']
  }, [pathname])

  return null
}

function App() {
  return (
    <>
      <RouteTitle />
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="work" element={<Work />} />
        <Route path="work/:brand" element={<CaseStudy />} />
        <Route path="film" element={<Film />} />
        <Route path="narrative" element={<Narrative />} />
        <Route path="about" element={<About level="h1" />} />
        <Route path="cv" element={<CV />} />
        <Route path="contact" element={<Contact level="h1" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      </Routes>
    </>
  )
}

export default App