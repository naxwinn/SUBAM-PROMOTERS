import EnquiryForm from '@/components/EnquiryForm'
import PageHero from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { useSeo } from '@/lib/seo'
import { company, divisions } from '@/lib/site'

import './contact.css'

export default function Contact() {
  useSeo({
    title: 'Contact',
    description: `Discuss a property promotion or digital marketing project with ${company.name}. Send an enquiry, email us or call.`,
    path: '/contact/',
  })

  return (
    <>
      <PageHero
        title="Discuss Your Project"
        lede="Tell us what you are promoting and what a good outcome looks like. We will reply with a view on where to start."
        trail={[{ label: 'Contact' }]}
        image="contentStudio"
      />

      <Section tone="page">
        <div className="contact">
          <div className="contact__form">
            <EnquiryForm />
          </div>

          <aside className="contact__aside">
            <div className="contact__block">
              <h2>Talk to us directly</h2>
              <ul className="contact__list">
                <li>
                  <span>Email</span>
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </li>
                <li>
                  <span>Phone</span>
                  <a href={company.phoneHref}>{company.phone}</a>
                </li>
                <li>
                  <span>WhatsApp</span>
                  <a href={company.whatsappHref} target="_blank" rel="noreferrer noopener">
                    Message us
                  </a>
                </li>
                <li>
                  <span>Based in</span>
                  <p>{company.location}</p>
                </li>
              </ul>
            </div>

            <div className="contact__block">
              <h2>Which division?</h2>
              <p className="contact__hint">
                If you already know, choose it in the form — it routes your enquiry to the right
                people. If you are not sure, leave it and we will work it out.
              </p>
              <ul className="contact__divisions">
                {divisions.map(division => (
                  <li key={division.id}>
                    <strong>{division.shortName}</strong>
                    <span>{division.cardDescription}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="contact__block">
              <h2>What happens next</h2>
              <ol className="contact__next">
                <li>We read the enquiry and check it is something we can help with.</li>
                <li>We reply by email, usually within one working day.</li>
                <li>If it looks like a fit, we set up a call to go through the detail.</li>
              </ol>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}
