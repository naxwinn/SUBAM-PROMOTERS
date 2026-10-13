import { Link } from 'react-router-dom'

import PageHero from '@/components/layout/PageHero'
import Picture from '@/components/ui/Picture'
import { Section } from '@/components/ui/Section'
import FinalCTA from '@/components/sections/FinalCTA'
import { useSeo } from '@/lib/seo'
import { insights } from '@/lib/site'

import './insights.css'

export default function Insights() {
  useSeo({
    title: 'Insights',
    description:
      'Practical notes on property marketing, campaign measurement and creative production from the team at SUBAM PROMOTERS.',
    path: '/insights/',
  })

  return (
    <>
      <PageHero
        title="Insights"
        lede="Practical notes on promoting property and running campaigns — written for the people who have to make the decisions."
        trail={[{ label: 'Insights' }]}
      />

      <Section tone="page">
        <ul className="insight-list">
          {insights.map(article => (
            <li key={article.slug}>
              <article className="insight-card">
                <Link to={`/insights/${article.slug}/`} className="insight-card__media" tabIndex={-1} aria-hidden="true">
                  <Picture image={article.image} ratio="4 / 3" />
                </Link>
                <div className="insight-card__body">
                  <p className="insight-card__meta">
                    <span className="insight-card__category">{article.category}</span>
                    <span>{article.readingTime}</span>
                  </p>
                  <h2 className="insight-card__title">
                    <Link to={`/insights/${article.slug}/`}>{article.title}</Link>
                  </h2>
                  <p className="insight-card__summary">{article.summary}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <FinalCTA />
    </>
  )
}
