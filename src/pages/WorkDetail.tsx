import { Link, Navigate, useParams } from 'react-router-dom'

import PageHero from '@/components/layout/PageHero'
import Parallax from '@/components/motion/Parallax'
import FinalCTA from '@/components/sections/FinalCTA'
import Button from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { images } from '@/lib/assets'
import { useSeo } from '@/lib/seo'
import { workItems } from '@/lib/site'

import './work-detail.css'

export default function WorkDetail() {
  const { slug } = useParams()
  const item = workItems.find(entry => entry.slug === slug)
  const fallbackTitle = item?.title ?? 'Project'

  useSeo({
    title: fallbackTitle,
    description: item?.brief ?? 'Project detail',
    path: `/our-work/${slug}/`,
    image: item ? images[item.image].jpg : undefined,
    type: 'article',
  })

  if (!item) return <Navigate to="/our-work/" replace />

  const next = workItems[(workItems.indexOf(item) + 1) % workItems.length]

  return (
    <>
      <PageHero
        title={item.title}
        trail={[{ label: 'Our Work', to: '/our-work/' }, { label: item.title }]}
        image={item.image}
      >
        <p className="work-detail__status">{item.status}</p>
      </PageHero>

      <Section tone="page">
        <div className="work-detail">
          <div className="work-detail__main">
            <h2>Brief</h2>
            <p>{item.brief}</p>

            <h2>Objective</h2>
            <p>{item.objective}</p>

            <h2>Creative sample</h2>
            <Parallax image={item.image} ratio="16 / 9" strength={9} />
            <p className="work-detail__caption">
              Reference imagery supplied for this concept. It illustrates the direction and does
              not depict a completed client project.
            </p>
          </div>

          <aside className="work-detail__aside">
            <dl className="work-meta">
              <div>
                <dt>Category</dt>
                <dd>{item.category}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{item.status}</dd>
              </div>
              <div>
                <dt>Services delivered</dt>
                <dd>
                  <ul>
                    {item.delivered.map(service => (
                      <li key={service}>{service}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Results</dt>
                {/* Honest by default: nothing is claimed that has not been verified. */}
                <dd className="work-meta__muted">
                  Not published. This is a conceptual project, so there is no verified performance
                  data to report.
                </dd>
              </div>
            </dl>

            <Button to="/contact/" variant="gold">
              Discuss a project like this
            </Button>
          </aside>
        </div>

        <nav className="work-detail__next" aria-label="More work">
          <Link to={`/our-work/${next.slug}/`}>
            <span className="work-detail__next-label">Next project</span>
            <span className="work-detail__next-title">{next.title}</span>
          </Link>
        </nav>
      </Section>

      <FinalCTA />
    </>
  )
}
