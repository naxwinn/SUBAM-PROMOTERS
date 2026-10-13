import { Outlet } from 'react-router-dom'

import SmoothScroll from '@/components/motion/SmoothScroll'
import { useOrganisationSchema } from '@/lib/seo'

import Footer from './Footer'
import Header from './Header'

export default function Layout() {
  useOrganisationSchema()

  return (
    <>
      <a className="u-skip-link" href="#main">
        Skip to content
      </a>
      <SmoothScroll />
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
