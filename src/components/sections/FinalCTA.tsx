import Button from '@/components/ui/Button'
import { images } from '@/lib/assets'
import { company, features } from '@/lib/site'

import './final-cta.css'

export default function FinalCTA() {
  return (
    <section className="final-cta u-on-dark">
      <div className="final-cta__media" aria-hidden="true">
        <picture>
          <source srcSet={images.aerialBoulevard.webp} type="image/webp" />
          <img
            src={images.aerialBoulevard.jpg}
            alt=""
            width={images.aerialBoulevard.width}
            height={images.aerialBoulevard.height}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>

      <div className="final-cta__inner u-container">
        <h2 className="final-cta__title">Tell us what you are promoting.</h2>
        <p className="final-cta__lede">
          Share the project or the business, and we will come back with a view on what the
          promotion should do first. No obligation, and no pitch deck until there is something
          worth pitching.
        </p>

        <div className="final-cta__actions">
          <Button to="/contact/" variant="gold" size="lg">
            Discuss Your Project
          </Button>
          {/* Falls back to a published page while Our Work is unreleased. */}
          {features.ourWorkPublic ? (
            <Button to="/our-work/" variant="secondary" size="lg">
              See how we approach a brief
            </Button>
          ) : (
            <Button to="/about/" variant="secondary" size="lg">
              How we work
            </Button>
          )}
        </div>

        <p className="final-cta__direct">
          <span>
            Prefer to talk? <a href={company.phoneHref}>{company.phone}</a>
          </span>
          <span>
            Or email <a href={`mailto:${company.email}`}>{company.email}</a>
          </span>
        </p>
      </div>
    </section>
  )
}
