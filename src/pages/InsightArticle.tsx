import { Link, Navigate, useParams } from 'react-router-dom'

import PageHero from '@/components/layout/PageHero'
import FinalCTA from '@/components/sections/FinalCTA'
import { Section } from '@/components/ui/Section'
import { images } from '@/lib/assets'
import { useSeo } from '@/lib/seo'
import { insights } from '@/lib/site'

import './insight-article.css'

export default function InsightArticle() {
  const { slug } = useParams()
  const article = insights.find(entry => entry.slug === slug)

  useSeo({
    title: article?.title ?? 'Insight',
    description: article?.summary ?? 'Insight',
    path: `/insights/${slug}/`,
    image: article ? images[article.image].jpg : undefined,
    type: 'article',
  })

  if (!article) return <Navigate to="/insights/" replace />

  const others = insights.filter(entry => entry.slug !== article.slug)

  return (
    <>
      <PageHero
        title={article.title}
        trail={[{ label: 'Insights', to: '/insights/' }, { label: article.title }]}
        image={article.image}
      >
        <p className="article__meta">
          {article.category} · {article.readingTime}
        </p>
      </PageHero>

      <Section tone="page">
        <article className="article">
          <p className="article__lede">{article.summary}</p>
          {article.body.map(paragraph => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </article>

        <aside className="article__more">
          <h2>More insights</h2>
          <ul>
            {others.map(entry => (
              <li key={entry.slug}>
                <Link to={`/insights/${entry.slug}/`}>{entry.title}</Link>
                <span>{entry.readingTime}</span>
              </li>
            ))}
          </ul>
        </aside>
      </Section>

      <FinalCTA />
    </>
  )
}
