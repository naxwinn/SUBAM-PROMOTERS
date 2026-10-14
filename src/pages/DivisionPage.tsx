import { Link } from 'react-router-dom'

import EnquiryForm from '@/components/EnquiryForm'
import PageHero from '@/components/layout/PageHero'
import Parallax from '@/components/motion/Parallax'
import Reveal from '@/components/motion/Reveal'
import Button from '@/components/ui/Button'
import { Section, SectionHead } from '@/components/ui/Section'
import { images } from '@/lib/assets'
import { useSeo } from '@/lib/seo'
import { divisions, features, processSteps, workItems, type Division } from '@/lib/site'

import './division-page.css'

const seoCopy: Record<Division['id'], string> = {
  'real-estate':
    'Property marketing and project promotion: campaign planning, property video, promotional content, lead generation campaigns and project landing pages.',
  digital:
    'Digital marketing and business promotion: Google Ads, Meta Ads, social media management, promotional video, creative production and conversion optimisation.',
}

export default function DivisionPage({ id }: { id: Division['id'] }) {
  const division = divisions.find(item => item.id === id)!
  const other = divisions.find(item => item.id !== id)!
  const related = workItems.filter(item =>
    id === 'real-estate'
      ? item.category === 'Real Estate Projects'
      : item.category === 'Digital Campaigns' || item.category === 'Video Production',
  )

  useSeo({
    title: division.name,
    description: seoCopy[id],
    path: division.to,
    image: images[division.image].jpg,
  })

  return (
    <>
      <PageHero
        title={division.name}
        lede={division.intro}
        image={division.image}
        trail={[{ label: division.shortName }]}
      >
        <Button to="#enquire" variant="gold" size="lg">
          Discuss Your Project
        </Button>
      </PageHero>

      <Section tone="page">
        <SectionHead
          title="What this division does"
          lede="Engagements are assembled from these. Most projects use some of them, not all."
        />
        <Reveal as="div" className="division-services" stagger>
          {division.services.map(service => (
            <article className="division-service" key={service.title}>
              <h3 className="division-service__title">{service.title}</h3>
              <p className="division-service__body">{service.description}</p>
            </article>
          ))}
        </Reveal>
      </Section>

      <Section tone="soft" ruled>
        <div className="division-split">
          <div className="division-split__media">
            <Parallax image={division.secondaryImage} ratio="4 / 3" strength={9} />
          </div>
          <div className="division-split__body">
            <h2>How we start</h2>
            <ol className="division-steps">
              {processSteps.map(step => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {features.ourWorkPublic && related.length > 0 ? (
        <Section tone="page">
          <SectionHead
            title="Related work"
            lede="Conceptual pieces that show the approach. These are not client campaigns."
          />
          <div className="division-related">
            {related.map(item => (
              <article className="division-related__item" key={item.slug}>
                <Link to={`/our-work/${item.slug}/`}>
                  <Parallax image={item.image} ratio="3 / 2" strength={7} />
                  <p className="division-related__status">{item.status}</p>
                  <h3>{item.title}</h3>
                </Link>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      <Section tone="mid">
        <div className="division-cross">
          <div>
            <h2>Also worth knowing</h2>
            <p>
              {other.name} is our other division, run by the same team to the same standard. Many
              projects use both — a development that needs promotion usually needs a digital
              presence behind it.
            </p>
          </div>
          <Button to={other.to} variant="secondary" size="lg">
            {other.cta}
          </Button>
        </div>
      </Section>

      <Section tone="soft" id="enquire">
        <div className="division-enquire">
          <SectionHead
            title={`Enquire about ${division.shortName.toLowerCase()}`}
            lede="Tell us what you are promoting. We will reply with a view on what to do first."
          />
          <EnquiryForm defaultDivision={division.id} />
        </div>
      </Section>
    </>
  )
}
