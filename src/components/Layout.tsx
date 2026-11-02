import { Header } from './Header'
import { Footer } from './Footer'
import { Cursor } from './Cursor'
import { Grain } from './Grain'
import { Loader } from './Loader'
import { RouteTransition } from './RouteTransition'
import { useSmoothScroll } from '../motion/useSmoothScroll'

/**
 * Layout — the chrome every route shares.
 *
 * Order matters: the smooth-scroll rig boots here once (not per page, which
 * would stack Lenis instances), and the skip link is the first focusable thing
 * on the page. RouteTransition owns <main>, so this component never renders a
 * second one.
 */
export const Layout = () => {
  useSmoothScroll()

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <RouteTransition />
      <Footer />
      <Cursor />
      <Grain />
      <Loader />
    </>
  )
}
