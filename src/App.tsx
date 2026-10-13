import { Suspense, lazy } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'

/**
 * Home ships in the initial bundle because it is the entry point for most
 * visits. Every other route is fetched on demand, which keeps the first load
 * to the hero, the division cards and the motion layer.
 */
const About = lazy(() => import('@/pages/About'))
const Contact = lazy(() => import('@/pages/Contact'))
const DivisionPage = lazy(() => import('@/pages/DivisionPage'))
const InsightArticle = lazy(() => import('@/pages/InsightArticle'))
const Insights = lazy(() => import('@/pages/Insights'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const OurWork = lazy(() => import('@/pages/OurWork'))
const WorkDetail = lazy(() => import('@/pages/WorkDetail'))
const PrivacyPolicy = lazy(() =>
  import('@/pages/Legal').then(module => ({ default: module.PrivacyPolicy })),
)
const TermsAndConditions = lazy(() =>
  import('@/pages/Legal').then(module => ({ default: module.TermsAndConditions })),
)

/** Holds the layout height during a chunk fetch so the page does not jump. */
function RouteFallback() {
  return <div style={{ minHeight: '70vh' }} aria-busy="true" />
}

/**
 * Routes use trailing slashes to match the agreed URL structure. Each path is
 * also registered without the slash and redirects, so a hand-typed or shared
 * link without it still resolves instead of hitting the 404.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route
          element={
            <Suspense fallback={<RouteFallback />}>
              <LazyOutlet />
            </Suspense>
          }
        >
          <Route path="/about/" element={<About />} />
          <Route path="/about" element={<Navigate to="/about/" replace />} />

          <Route path="/real-estate-promotion/" element={<DivisionPage id="real-estate" />} />
          <Route
            path="/real-estate-promotion"
            element={<Navigate to="/real-estate-promotion/" replace />}
          />

          <Route path="/digital-marketing/" element={<DivisionPage id="digital" />} />
          <Route path="/digital-marketing" element={<Navigate to="/digital-marketing/" replace />} />

          <Route path="/our-work/" element={<OurWork />} />
          <Route path="/our-work" element={<Navigate to="/our-work/" replace />} />
          <Route path="/our-work/:slug/" element={<WorkDetail />} />
          <Route path="/our-work/:slug" element={<WorkDetail />} />

          <Route path="/insights/" element={<Insights />} />
          <Route path="/insights" element={<Navigate to="/insights/" replace />} />
          <Route path="/insights/:slug/" element={<InsightArticle />} />
          <Route path="/insights/:slug" element={<InsightArticle />} />

          <Route path="/contact/" element={<Contact />} />
          <Route path="/contact" element={<Navigate to="/contact/" replace />} />

          <Route path="/privacy-policy/" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<Navigate to="/privacy-policy/" replace />} />

          <Route path="/terms-and-conditions/" element={<TermsAndConditions />} />
          <Route
            path="/terms-and-conditions"
            element={<Navigate to="/terms-and-conditions/" replace />}
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}

/* The lazy routes share one Suspense boundary via this pass-through outlet. */
function LazyOutlet() {
  return <Outlet />
}
