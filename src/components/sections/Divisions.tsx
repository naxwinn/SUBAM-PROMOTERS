import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import FlipCard from '@/components/FlipCard'
import Picture from '@/components/ui/Picture'
import { Section, SectionHead } from '@/components/ui/Section'
import { isCoarsePointer, prefersReducedMotion } from '@/lib/motion'
import { divisions, type Division } from '@/lib/site'

import './divisions.css'

/** Card geometry per breakpoint. Both divisions always share one size. */
function useCardSize() {
  const [size, setSize] = useState({ width: 420, height: 480 })

  useEffect(() => {
    const sync = () => {
      const vw = window.innerWidth
      if (vw < 480) setSize({ width: Math.min(vw - 48, 340), height: 470 })
      else if (vw < 900) setSize({ width: 380, height: 480 })
      else setSize({ width: 420, height: 480 })
    }
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  return size
}

function Front({ division }: { division: Division }) {
  return (
    <div className="division-card__front">
      <Picture image={division.image} className="division-card__media" />
      <div className="division-card__front-body">
        <h3 className="division-card__name">{division.name}</h3>
        <p className="division-card__desc">{division.cardDescription}</p>
        {/* A rotate glyph, not a square — a square reads as an empty checkbox. */}
        <p className="division-card__cue" aria-hidden="true">
          <svg
            className="division-card__cue-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
          Discover what we do
        </p>
      </div>
    </div>
  )
}

function Back({
  division,
  ctaRef,
}: {
  division: Division
  ctaRef: React.RefObject<HTMLAnchorElement | null>
}) {
  return (
    <div className="division-card__back">
      <h3 className="division-card__name division-card__name--back">{division.shortName}</h3>
      <p className="division-card__intro">{division.backIntro}</p>

      <ul className="division-card__services">
        {division.services.slice(0, 5).map(service => (
          <li key={service.title}>{service.title}</li>
        ))}
      </ul>

      <p className="division-card__benefit">{division.benefit}</p>

      {/*
        A real anchor with a real href: keyboard activation, middle-click,
        "open in new tab" and crawlers all work through it normally. Pointer
        activation is additionally guaranteed by the capture-phase handlers on
        the card wrapper — see the note there.
      */}
      {/*
        Enter and Space must not reach the card.

        FlipCard's root handles both keys to flip, and calls preventDefault() on
        them. Because keydown bubbles up from whatever is focused, that cancels
        the anchor's own activation — so a keyboard user focused on this link
        could press Enter and get a card flip instead of navigation. Stopping
        propagation here keeps the key with the control that has focus.
      */}
      <Link
        ref={ctaRef}
        to={division.to}
        className="division-card__cta"
        onKeyDown={event => event.stopPropagation()}
      >
        {division.cta}
      </Link>
    </div>
  )
}

/** Static equivalent: everything on one face, no flip, no motion. */
function StaticCard({ division }: { division: Division }) {
  return (
    <article className="division-static">
      <Picture image={division.image} className="division-static__media" ratio="16 / 10" />
      <div className="division-static__body">
        <h3>{division.name}</h3>
        <p>{division.cardDescription}</p>
        <ul className="division-card__services">
          {division.services.slice(0, 5).map(service => (
            <li key={service.title}>{service.title}</li>
          ))}
        </ul>
        <p className="division-card__benefit">{division.benefit}</p>
        <Link to={division.to} className="division-card__cta">
          {division.cta}
        </Link>
      </div>
    </article>
  )
}

/** Matches the FlipCard spring (stiffness 170 / damping 20) settling time. */
const FLIP_SETTLE_MS = 700

function DivisionCard({ division }: { division: Division }) {
  const [flipped, setFlipped] = useState(false)
  const [settling, setSettling] = useState(false)
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const navigate = useNavigate()
  const { width, height } = useCardSize()
  const coarse = isCoarsePointer()

  /*
    While the card is rotating it is edge-on, and a click can land on whichever
    face happens to be under the pointer — occasionally the front face rather
    than the back-face CTA the visitor aimed at. Suppressing pointer events on
    the faces for the duration of the flip makes the outcome deterministic: the
    click either flips the card or activates the CTA, never the wrong one.
  */
  const handleFlipChange = (next: boolean) => {
    setFlipped(next)
    setSettling(true)
    if (settleTimer.current) clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => setSettling(false), FLIP_SETTLE_MS)
  }

  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current)
  }, [])

  /*
    Pointer activation for the back-face CTA is resolved by coordinates on the
    wrapper, not by letting the browser hit-test it.

    The faces live inside a `transform-style: preserve-3d` rotor. At the settled
    rotation Chromium intermittently fails to hit-test the facing back face and
    sends the pointer to the rotor instead, so the link never receives the click
    and the CTA silently does nothing — reproduced at 8 failures in 20 attempts,
    and only reduced to 4 by correcting backface-visibility. Testing the click
    point against the link's own rectangle removes the dependency on 3D
    hit-testing entirely, so activation is deterministic.

    These run in the capture phase, before FlipCard's handlers, so a click aimed
    at the CTA also cannot flip the card underneath it.

    Keyboard activation is untouched: synthesised clicks carry clientX/clientY
    of 0, fall outside the rectangle, and the anchor handles them itself.
  */
  const pointerIsOnCta = (event: { clientX: number; clientY: number }) => {
    if (!flipped || settling) return false
    const rect = ctaRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return false
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    )
  }

  return (
    <article
      className={`division-card ${settling ? 'is-settling' : ''} ${
        flipped && !settling ? 'is-flipped' : ''
      }`}
      onPointerDownCapture={event => {
        if (pointerIsOnCta(event)) event.stopPropagation()
      }}
      onClickCapture={event => {
        if (!pointerIsOnCta(event)) return
        event.preventDefault()
        event.stopPropagation()
        navigate(division.to)
      }}
    >
      <FlipCard
        flipped={flipped}
        onFlipChange={handleFlipChange}
        front={<Front division={division} />}
        back={<Back division={division} ctaRef={ctaRef} />}
        axis="y"
        flipOnClick
        /* Dragging would compete with vertical page scrolling on touch. */
        draggable={false}
        /*
          Tilt, glare and hover-scale apply to the front face only.

          The back face carries the division link, and those effects keep the
          surface moving under the pointer — measured at roughly a pixel of
          drift while hovered. If mousedown and mouseup land on different
          elements the browser dispatches `click` on their common ancestor
          rather than the link, and the CTA silently fails to navigate. The
          front face has no links, so it keeps the affordance.
        */
        tilt={!coarse && !flipped}
        tiltMax={5}
        glare={!coarse && !flipped}
        glareOpacity={0.1}
        hoverScale={coarse || flipped ? 1 : 1.015}
        perspective={1100}
        width={width}
        height={height}
        radius={18}
        background="#063B3D"
        color="#F9F2E2"
        shadow
        shadowColor="#012224"
        shadowOpacity={0.22}
        ariaLabel={`${division.name} — flip for services`}
      />

      {/*
        An explicit control, so flipping is never something a visitor has to
        guess at, and so the card is operable from the keyboard without
        depending on the card surface itself receiving focus.
      */}
      <button
        type="button"
        className="division-card__toggle"
        aria-pressed={flipped}
        onClick={() => handleFlipChange(!flipped)}
      >
        {flipped ? `Show ${division.shortName} overview` : `Show ${division.shortName} services`}
      </button>
    </article>
  )
}

export default function Divisions() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return (
    <Section id="divisions" tone="soft" ruled>
      <SectionHead
        title="Two Divisions. One Commitment to Growth."
        lede="Whether you are promoting a property development or growing a business, we bring strategy, creative execution and purposeful promotion together."
        align="center"
      />

      <div className="divisions__grid">
        {divisions.map(division =>
          reduced || prefersReducedMotion() ? (
            <StaticCard key={division.id} division={division} />
          ) : (
            <DivisionCard key={division.id} division={division} />
          ),
        )}
      </div>
    </Section>
  )
}
