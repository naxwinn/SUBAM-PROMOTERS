import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ElementType, type ReactNode } from 'react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Props = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Stagger direct children instead of revealing the block as one unit. */
  stagger?: boolean
}

/**
 * A restrained entrance: 12px rise and a fade, once, on first approach.
 *
 * Content is visible in the DOM at all times — the tween animates *from* a
 * hidden state rather than *to* one, so if JavaScript never runs, or a crawler
 * reads the page, everything is still present and styled.
 */
export default function Reveal({ children, as: Tag = 'div', className = '', stagger = false }: Props) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = stagger ? Array.from(root.current?.children ?? []) : root.current
        if (!targets || (Array.isArray(targets) && targets.length === 0)) return

        gsap.from(targets, {
          opacity: 0,
          y: 12,
          duration: 0.45,
          ease: 'power1.out',
          stagger: stagger ? 0.07 : 0,
          scrollTrigger: {
            trigger: root.current,
            start: 'top 90%',
            once: true,
          },
        })
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <Tag ref={root} className={className}>
      {children}
    </Tag>
  )
}
