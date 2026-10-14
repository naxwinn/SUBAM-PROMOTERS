import { Link } from 'react-router-dom'

import Parallax from '@/components/motion/Parallax'
import Button from '@/components/ui/Button'
import { Section, SectionHead } from '@/components/ui/Section'
import { features, workItems } from '@/lib/site'

import './selected-work.css'

/**
 * Alternating editorial rows. Every item is labelled with its real status —
 * nothing here is presented as delivered client work, because none of it is.
 */
export default function SelectedWork() {
  /* Nothing is promoted while the Our Work page is unpublished — every link
     in this section points into it. */
  if (!features.ourWorkPublic) return null

  const featured = workItems.slice(0, 3)

  return (
    <Section tone="page">
      <SectionHead
        title="Work That Brings Ideas to Life."
        lede="The pieces below are conceptual, built to show how we approach a brief. They are not client campaigns, and no results are claimed for them."
      />

      <div className="work-rows">
        {featured.map((item, index) => (
          <article className={`work-row ${index % 2 === 1 ? 'work-row--flip' : ''}`} key={item.slug}>
            <Link to={`/our-work/${item.slug}/`} className="work-row__media" tabIndex={-1} aria-hidden="true">
              <Parallax image={item.image} ratio="4 / 3" strength={8} />
            </Link>

            <div className="work-row__body">
              <p className="work-row__status">{item.status}</p>
              <h3 className="work-row__title">
                <Link to={`/our-work/${item.slug}/`}>{item.title}</Link>
              </h3>
              <p className="work-row__category">{item.category}</p>
              <p className="work-row__brief">{item.brief}</p>
              <Link to={`/our-work/${item.slug}/`} className="work-row__link">
                View this project
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="work-rows__footer">
        <Button to="/our-work/" variant="secondary" size="lg">
          Explore Our Work
        </Button>
      </div>
    </Section>
  )
}
