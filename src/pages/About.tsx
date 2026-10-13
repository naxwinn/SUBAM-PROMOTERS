import PageHero from '@/components/layout/PageHero'
import Parallax from '@/components/motion/Parallax'
import FinalCTA from '@/components/sections/FinalCTA'
import Principles from '@/components/sections/Principles'
import Button from '@/components/ui/Button'
import { Section, SectionHead } from '@/components/ui/Section'
import { useSeo } from '@/lib/seo'
import { company, divisions } from '@/lib/site'

import './about.css'

export default function About() {
  useSeo({
    title: 'About Us',
    description:
      'SUBAM PROMOTERS brings together real estate marketing and digital business promotion. Learn how the two divisions work and what to expect from an engagement.',
    path: '/about/',
  })

  return (
    <>
      <PageHero
        title="A promotions company built around two kinds of growth"
        lede={`${company.name} helps property projects gain visibility and helps businesses promote what they do. Both sit under one roof because the thinking behind them is the same.`}
        trail={[{ label: 'About Us' }]}
        image="campaignReview"
      />

      <Section tone="page">
        <div className="about-intro">
          <div className="about-intro__body">
            <h2>What we do</h2>
            <p>
              A property project and a growing business have the same underlying problem: the
              people who would value them do not yet know they exist. Solving that takes a clear
              position, creative that communicates it and campaigns pointed at the right audience.
            </p>
            <p>
              We work on both sides of that problem. One division promotes developments to buyers.
              The other builds and runs the digital presence a business needs. Neither is a
              bolt-on to the other.
            </p>
            <p>
              Our tagline is <strong>{company.tagline}</strong> — it describes the two halves
              deliberately, in that order, with equal weight.
            </p>
          </div>

          <aside className="about-divisions">
            <h2 className="about-divisions__title">The two divisions</h2>
            {divisions.map(division => (
              <article className="about-division" key={division.id}>
                <h3>{division.name}</h3>
                <p>{division.cardDescription}</p>
                <Button to={division.to} variant="ghost">
                  {division.cta}
                </Button>
              </article>
            ))}
          </aside>
        </div>
      </Section>

      <Section tone="soft" ruled>
        <div className="about-split">
          <Parallax image="villaDusk" ratio="3 / 4" strength={10} />
          <div className="about-split__body">
            <SectionHead
              title="How we talk about results"
              lede="A short note on what we will and will not claim."
            />
            <p>
              Marketing results depend on the project, the market and the price. We do not publish
              lead volumes, sales figures or percentage improvements, because any number presented
              without its context is closer to decoration than evidence.
            </p>
            <p>
              What we will do is agree the objective before a campaign starts, report against it
              honestly and tell you when something is not working. Where we have permission and
              verified data to share, we will share it here.
            </p>
            <p>
              The work shown on this site is conceptual and labelled as such. It demonstrates
              approach, not outcomes.
            </p>
          </div>
        </div>
      </Section>

      <Principles />
      <FinalCTA />
    </>
  )
}
