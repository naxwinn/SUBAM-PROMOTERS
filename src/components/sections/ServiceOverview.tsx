import { Link } from 'react-router-dom'

import { Section, SectionHead } from '@/components/ui/Section'
import Reveal from '@/components/motion/Reveal'
import { divisions } from '@/lib/site'

import './service-overview.css'

/**
 * Twelve services split across two divisions. The grid gives each division its
 * own column group rather than interleaving them, so neither reads as a subset
 * of the other.
 */
export default function ServiceOverview() {
  return (
    <Section tone="page">
      <SectionHead
        title="Strategic Services. Purposeful Promotion."
        lede="Each engagement draws on whichever of these the project actually needs — not a fixed package."
      />

      <div className="services">
        {divisions.map(division => (
          <div className="services__division" key={division.id}>
            <div className="services__head">
              <h3 className="services__title">{division.name}</h3>
              <Link to={division.to} className="services__link">
                {division.cta}
              </Link>
            </div>

            <Reveal as="ul" className="services__list" stagger>
              {division.services.map(service => (
                <li className="services__item" key={service.title}>
                  <h4 className="services__item-title">{service.title}</h4>
                  <p className="services__item-body">{service.description}</p>
                </li>
              ))}
            </Reveal>
          </div>
        ))}
      </div>
    </Section>
  )
}
