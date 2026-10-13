import { Section, SectionHead } from '@/components/ui/Section'
import { processSteps } from '@/lib/site'

import './process.css'

/**
 * The one genuinely sequential piece of content on the site, so the one place
 * numbered markers are warranted. Horizontal on desktop, vertical on mobile;
 * the connecting rule is drawn in CSS and carries no animation, so the
 * information is never gated behind a transition.
 */
export default function Process() {
  return (
    <Section tone="soft">
      <SectionHead
        title="How an engagement runs"
        lede="Four stages, in order. Each one produces something you can review before the next begins."
      />

      <ol className="process">
        {processSteps.map((step, index) => (
          <li className="process__step" key={step.title}>
            <span className="process__marker" aria-hidden="true">
              {index + 1}
            </span>
            <h3 className="process__title">{step.title}</h3>
            <p className="process__body">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
