import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ReactNode } from 'react'

import { images, type ImageKey } from '@/lib/assets'

import './parallax.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Props = {
  image: ImageKey
  /** Travel distance as a percentage of image height. Kept in the 6–14 range. */
  strength?: number
  /** Aspect ratio of the visible window, e.g. '16 / 9'. */
  ratio?: string
  priority?: boolean
  className?: string
  children?: ReactNode
  /** Darkens the image so overlaid ivory text stays readable. */
  scrim?: 'none' | 'soft' | 'strong'
}

/**
 * An image in a clipped window that drifts slower than the page.
 *
 * The image is oversized by exactly the travel distance, so it can move without
 * ever exposing an edge. Only this decorative layer moves — never text, never a
 * control. useGSAP scopes and reverts every tween and ScrollTrigger on unmount,
 * which also makes StrictMode's double-mount a no-op.
 */
export default function Parallax({
  image,
  strength = 10,
  ratio = '16 / 9',
  priority = false,
  className = '',
  children,
  scrim = 'none',
}: Props) {
  const root = useRef<HTMLDivElement>(null)
  const asset = images[image]

  useGSAP(
    () => {
      const layer = root.current?.querySelector('.parallax__img')
      if (!layer) return

      /* matchMedia keeps the reduced-motion branch declarative: GSAP reverts the
         animation automatically when the query stops matching. */
      const mm = gsap.matchMedia()

      mm.add(
        {
          animate: '(prefers-reduced-motion: no-preference)',
          still: '(prefers-reduced-motion: reduce)',
        },
        context => {
          if (!context.conditions?.animate) return

          gsap.fromTo(
            layer,
            { yPercent: -strength / 2 },
            {
              yPercent: strength / 2,
              ease: 'none',
              scrollTrigger: {
                trigger: root.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        },
      )

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      className={`parallax parallax--scrim-${scrim} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <picture>
        <source srcSet={asset.webp} type="image/webp" />
        <img
          className="parallax__img"
          src={asset.jpg}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          style={{ height: `calc(100% + ${strength}%)` }}
        />
      </picture>
      {children ? <div className="parallax__content">{children}</div> : null}
    </div>
  )
}
