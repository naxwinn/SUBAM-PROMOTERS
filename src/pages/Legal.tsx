import PageHero from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { useSeo } from '@/lib/seo'
import { company } from '@/lib/site'

import './legal.css'

type Block = { heading: string; paragraphs: string[] }

/**
 * Baseline policies covering how this site actually behaves today.
 *
 * These describe real practice — what the enquiry form collects and what the
 * site does not do — rather than boilerplate for features that do not exist.
 * They are not legal advice and should be reviewed by a qualified adviser
 * before launch, particularly for DPDP Act compliance.
 */
const privacy: Block[] = [
  {
    heading: 'What we collect',
    paragraphs: [
      'When you submit the enquiry form we collect the name, email address, phone number (if you provide one), the division you selected, your message and the optional website-clarity rating.',
      'We do not collect any other personal information through this website, and we do not ask for financial or identity documents here.',
    ],
  },
  {
    heading: 'Why we collect it',
    paragraphs: [
      'We use these details for one purpose: to respond to your enquiry and, if the work proceeds, to carry it out. We do not sell your details and we do not pass them to third parties for marketing.',
    ],
  },
  {
    heading: 'Cookies and analytics',
    paragraphs: [
      'This website sets no advertising or tracking cookies of its own. Fonts are loaded from Google Fonts, which may record your IP address as part of serving that request.',
      'If analytics or advertising tags are added later, this section will be updated before they go live and a consent notice will be shown where one is required.',
    ],
  },
  {
    heading: 'How long we keep it',
    paragraphs: [
      'Enquiries are retained for as long as needed to respond and to keep a record of the conversation. You can ask us to delete your enquiry at any time.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      `To ask what we hold about you, to correct it, or to have it deleted, email ${company.email}. We will respond to the address you contact us from.`,
    ],
  },
]

const terms: Block[] = [
  {
    heading: 'About this website',
    paragraphs: [
      `This website is operated by ${company.name}. By using it you accept these terms.`,
    ],
  },
  {
    heading: 'The work shown here',
    paragraphs: [
      'Projects presented in the Our Work section are conceptual or illustrative and are labelled as such. They are not completed client campaigns, and no performance result is claimed for them.',
      'Nothing on this website is a guarantee of any specific marketing outcome, lead volume, enquiry count or sales figure. Marketing results depend on factors including the project, the market and the price.',
    ],
  },
  {
    heading: 'Images and content',
    paragraphs: [
      'The SUBAM PROMOTERS logo, the text on this site and the imagery supplied for it remain the property of their respective owners. Do not reproduce them without written permission.',
      'Photography is used to illustrate the type of work described. Unless stated otherwise, images do not depict a specific development offered for sale.',
    ],
  },
  {
    heading: 'Enquiries',
    paragraphs: [
      'Submitting the enquiry form does not create a contract. Any engagement begins only once scope, timelines and fees are agreed in writing.',
    ],
  },
  {
    heading: 'Links to other sites',
    paragraphs: [
      'Where this site links to an external service, we are not responsible for that service or its content.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [`Questions about these terms can be sent to ${company.email}.`],
  },
]

export function PrivacyPolicy() {
  useSeo({
    title: 'Privacy Policy',
    description: `How ${company.name} collects, uses and stores the information submitted through this website.`,
    path: '/privacy-policy/',
  })
  return <LegalPage title="Privacy Policy" blocks={privacy} />
}

export function TermsAndConditions() {
  useSeo({
    title: 'Terms & Conditions',
    description: `The terms that apply to using the ${company.name} website.`,
    path: '/terms-and-conditions/',
  })
  return <LegalPage title="Terms & Conditions" blocks={terms} />
}

function LegalPage({ title, blocks }: { title: string; blocks: Block[] }) {
  return (
    <>
      <PageHero title={title} trail={[{ label: title }]} />
      <Section tone="page">
        <div className="legal">
          <p className="legal__note">
            This policy reflects how the website works today. It is not legal advice, and it
            should be reviewed by a qualified adviser before launch.
          </p>
          {blocks.map(block => (
            <section className="legal__block" key={block.heading}>
              <h2>{block.heading}</h2>
              {block.paragraphs.map(paragraph => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </Section>
    </>
  )
}
