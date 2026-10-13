import { Section, SectionHead } from '@/components/ui/Section'
import { testimonials } from '@/lib/site'

import './testimonials.css'

/**
 * Renders nothing while `testimonials` is empty, which is its current state.
 * See the note beside the data in `src/lib/site.ts`.
 */
export default function Testimonials() {
  if (testimonials.length === 0) return null

  return (
    <Section tone="page">
      <SectionHead
        title="What clients say"
        lede="Feedback from people we have worked with, published with their permission."
      />
      <ul className="testimonials">
        {testimonials.map(item => (
          <li className="testimonial" key={item.name}>
            <blockquote className="testimonial__quote">{item.quote}</blockquote>
            <p className="testimonial__attribution">
              <span className="testimonial__name">{item.name}</span>
              <span className="testimonial__role">{item.role}</span>
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
