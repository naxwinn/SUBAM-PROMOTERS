import { useState } from 'react'
import { Link } from 'react-router-dom'

import PageHero from '@/components/layout/PageHero'
import Parallax from '@/components/motion/Parallax'
import FinalCTA from '@/components/sections/FinalCTA'
import { Section } from '@/components/ui/Section'
import { useSeo } from '@/lib/seo'
import { workCategories, workItems, type WorkCategory } from '@/lib/site'

import './our-work.css'

type Filter = WorkCategory | 'All'

export default function OurWork() {
  const [filter, setFilter] = useState<Filter>('All')

  useSeo({
    title: 'Our Work',
    description:
      'Conceptual projects and illustrative creative from SUBAM PROMOTERS across real estate promotion, digital campaigns, video production and creative work.',
    path: '/our-work/',
  })

  const shown = filter === 'All' ? workItems : workItems.filter(item => item.category === filter)
  const filters: Filter[] = ['All', ...workCategories]

  return (
    <>
      <PageHero
        title="Our Work"
        lede="Everything below is conceptual or illustrative, created to show how we approach a brief. No client is named, and no performance result is claimed."
        trail={[{ label: 'Our Work' }]}
      />

      <Section tone="page">
        {/* A real filter, not decoration — it changes what is listed. */}
        <div className="work-filters" role="group" aria-label="Filter work by category">
          {filters.map(item => (
            <button
              key={item}
              type="button"
              className={`work-filter ${filter === item ? 'is-active' : ''}`}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="work-count" role="status">
          {shown.length} {shown.length === 1 ? 'project' : 'projects'}
          {filter === 'All' ? '' : ` in ${filter}`}
        </p>

        <div className="work-grid">
          {shown.map(item => (
            <article className="work-card" key={item.slug}>
              <Link to={`/our-work/${item.slug}/`} className="work-card__link">
                <Parallax image={item.image} ratio="3 / 2" strength={8} />
                <div className="work-card__body">
                  <p className="work-card__status">{item.status}</p>
                  <h2 className="work-card__title">{item.title}</h2>
                  <p className="work-card__category">{item.category}</p>
                  <p className="work-card__brief">{item.brief}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <FinalCTA />
    </>
  )
}
