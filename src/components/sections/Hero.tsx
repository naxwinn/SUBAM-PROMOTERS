import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'

import SplitFlapText from '@/components/SplitFlapText'
import Button from '@/components/ui/Button'
import { images } from '@/lib/assets'
import { divisions } from '@/lib/site'

import './hero.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * The split-flap board is the one piece of showmanship on the site.
 *
 * It earns its place: a promotions company announces things, and a mechanical
 * departure board is what announcing looks like. It appears exactly once, at
 * eyebrow scale, and never again on any other page.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const [compact, setCompact] = useState(false)

  /* Tile size is driven by viewport width, not a CSS transform, so the board
     never overflows horizontally on a narrow screen. */
  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px)')
    const sync = () => setCompact(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        /* One orchestrated entrance, not a cascade of per-element fades. */
        gsap
          .timeline({ defaults: { ease: 'power2.out' } })
          .from('.hero__headline', { opacity: 0, y: 18, duration: 0.6 })
          .from('.hero__lede', { opacity: 0, y: 14, duration: 0.5 }, '-=0.35')
          .from('.hero__actions > *', { opacity: 0, y: 12, duration: 0.45, stagger: 0.08 }, '-=0.3')
          .from('.hero__board', { opacity: 0, duration: 0.5 }, '-=0.45')

        /* The photograph drifts; the text layer never does. */
        gsap.to('.hero__image', {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section className="hero u-on-dark" ref={root}>
      <div className="hero__media" aria-hidden="true">
        <picture>
          <source srcSet={images.villaStreet.webp} type="image/webp" />
          <img
            className="hero__image"
            src={images.villaStreet.jpg}
            alt=""
            width={images.villaStreet.width}
            height={images.villaStreet.height}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>

      <div className="hero__inner u-container">
        <div className="hero__board">
          <SplitFlapText
            words={['PROPERTY VISIBILITY', 'BUSINESS GROWTH', 'CREATIVE PROMOTION']}
            flipDuration={0.12}
            stagger={0.035}
            cycleDelay={3200}
            charset="alphanumeric"
            flipsPerChar={5}
            tileColor="#063B3D"
            textColor="#F9F2E2"
            tileRadius={4}
            gap={2}
            fontSize={compact ? 13 : 20}
            loop
            padTo={20}
          />
        </div>

        <h1 className="hero__headline">
          We Make Properties Stand Out. We Help Businesses Grow.
        </h1>

        <p className="hero__lede">
          From strategic property promotion to creative digital campaigns, SUBAM PROMOTERS helps
          projects and businesses build visibility, communicate their value and attract meaningful
          enquiries.
        </p>

        <div className="hero__actions">
          <Button to="/contact/" variant="gold" size="lg">
            Discuss Your Project
          </Button>
          <Button to="/#divisions" variant="secondary" size="lg">
            Explore Our Services
          </Button>
        </div>

        {/* Both divisions are named above the fold, at identical weight. */}
        <ul className="hero__divisions">
          {divisions.map(division => (
            <li key={division.id}>
              <a href={division.to}>{division.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
