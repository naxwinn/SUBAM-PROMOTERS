import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AccordionGallery from '@/components/AccordionGallery'
import PageHero from '@/components/layout/PageHero'
import { images } from '@/lib/assets'
import { useSeo } from '@/lib/seo'
import { insights } from '@/lib/site'

import './insights.css'

/**
 * Insights, built around the React Bits AccordionGallery.
 *
 * Panels come straight from the published `insights` array — three articles
 * today, and the gallery sizes itself to whatever that array holds. Nothing is
 * invented: every label, image, reading time and link belongs to a real
 * article with a real detail route.
 */
export default function Insights() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [vertical, setVertical] = useState(false)

  useSeo({
    title: 'Insights',
    description:
      'Practical perspectives on real estate marketing, property promotion, digital marketing and business growth from the team at SUBAM PROMOTERS.',
    path: '/insights/',
  })

  /* A horizontal accordion cannot stay usable once each collapsed panel is a
     sliver, so the gallery turns vertical on narrow screens instead. */
  useEffect(() => {
    const query = window.matchMedia('(max-width: 860px)')
    const sync = () => setVertical(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const items = useMemo(
    () =>
      insights.map(article => ({
        image: images[article.image].jpg,
        label: article.title,
        link: `/insights/${article.slug}/`,
        alt: images[article.image].alt,
      })),
    [],
  )

  /* Stable identity so the gallery's effect does not re-run every render. */
  const handleChange = useCallback((index: number) => setActiveIndex(index), [])

  /*
    Which panel was active when the pointer went down.

    Clicking an anchor fires `focus` before `click`, and the gallery selects on
    focus — so by the time the click arrives, the panel the visitor just
    pressed is already the active one. Comparing against the live active index
    would therefore navigate on the very first click of an unexplored panel.
    Sampling at pointerdown captures the state *before* that focus landed.

    Null means no pointer was involved: a keyboard activation, where focusing
    and then pressing Enter is a deliberate request to open the article.
  */
  const activeAtPointerDown = useRef<number | null>(null)

  /*
    The gallery renders each panel as a plain <a>. Left alone, activating one
    would be a full document load rather than a client-side route change, so
    this intercepts it and hands the URL to the router.

    Capture phase, and only when the clicked panel is already the active one —
    the component itself swallows clicks on inactive panels so that the first
    click selects rather than navigates. That ordering is what stops a visitor
    being thrown onto an article before they have explored the gallery.
  */
  const handleGalleryClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest('a.ag-panel')
    if (!anchor) return

    const panels = Array.from(event.currentTarget.querySelectorAll('.ag-panel'))
    const index = panels.indexOf(anchor)
    const wasActive = activeAtPointerDown.current
    activeAtPointerDown.current = null

    const href = anchor.getAttribute('href')
    if (!href || !href.startsWith('/')) return

    /* Always take over the anchor: letting it through would be a full document
       load rather than a route change. */
    event.preventDefault()

    /* A pointer press on a panel that was not already selected only selects
       it — the gallery's own focus handler has done that. Navigation waits for
       a second, deliberate activation. */
    if (wasActive !== null && wasActive !== index) return

    navigate(href)
  }

  const active = insights[Math.min(activeIndex, insights.length - 1)]

  return (
    <>
      <PageHero
        title="Insights"
        lede="Practical perspectives on real estate marketing, property promotion, digital marketing and business growth — written for the people who have to make the decisions."
        trail={[{ label: 'Insights' }]}
      />

      <section className="insights">
        <div className="u-container">
          <div
            className="insights__gallery"
            onPointerDownCapture={() => {
              activeAtPointerDown.current = activeIndex
            }}
            onClickCapture={handleGalleryClick}
          >
            <AccordionGallery
              items={items}
              defaultIndex={0}
              onChange={handleChange}
              orientation={vertical ? 'vertical' : 'horizontal'}
              trigger="hover"
              accentColor="#087E83"
              overlayColor="#082A35"
              textColor="#FFFFFF"
              grayscale={false}
              showLabels
              duration={0.6}
              gap={10}
              radius={14}
              expandRatio={0.52}
              height={vertical ? 230 : 460}
              parallax={0.35}
              tilt={5}
            />
          </div>

          <p className="insights__hint">
            {vertical
              ? 'Tap a panel to open it, then tap again to read the article.'
              : 'Hover or focus a panel to open it. Select it again to read the article.'}
          </p>

          {/* Details for the selected panel. Announced politely so a screen
              reader hears the change without losing its place. */}
          <article className="insights__detail" aria-live="polite">
            <p className="insights__meta">
              <span className="insights__category">{active.category}</span>
              <span className="insights__dot" aria-hidden="true" />
              <span className="insights__time">{active.readingTime}</span>
            </p>
            <h2 className="insights__title">{active.title}</h2>
            <p className="insights__summary">{active.summary}</p>
            <Link className="insights__read" to={`/insights/${active.slug}/`}>
              Read this insight
            </Link>
          </article>

          <aside className="insights__cta">
            <h2 className="insights__cta-title">Want this applied to your project?</h2>
            <p className="insights__cta-body">
              These notes come out of the work. If you are promoting a development or growing a
              business, tell us what you are working on and we will come back with a view on where
              to start.
            </p>
            <Link className="insights__cta-link" to="/contact/">
              Discuss Your Project
            </Link>
          </aside>
        </div>
      </section>
    </>
  )
}
