import Reveal from '@/components/motion/Reveal'
import { Section, SectionHead } from '@/components/ui/Section'
import { principles } from '@/lib/site'

import './principles.css'

/**
 * Four working principles. Deliberately unnumbered — they describe how we work,
 * not an order of operations, so numbering them would misdescribe the content.
 * The sequence that *is* a sequence lives in Process.
 */
export default function Principles() {
  return (
    <Section tone="mid" ruled>
      <SectionHead
        title="Thoughtful Strategy. Creative Execution. Clear Objectives."
        lede="How we work on an engagement, stated plainly. These are commitments about our process, not certifications or guarantees of outcome."
      />

      <Reveal as="div" className="principles" stagger>
        {principles.map(principle => (
          <article className="principle" key={principle.title}>
            <h3 className="principle__title">{principle.title}</h3>
            <p className="principle__body">{principle.body}</p>
          </article>
        ))}
      </Reveal>
    </Section>
  )
}
