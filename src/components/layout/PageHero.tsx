import type { ReactNode } from 'react'

import { images, type ImageKey } from '@/lib/assets'

import Breadcrumbs, { type Crumb } from './Breadcrumbs'
import './page-hero.css'

type Props = {
  title: string
  lede?: string
  trail: Crumb[]
  image?: ImageKey
  children?: ReactNode
}

export default function PageHero({ title, lede, trail, image, children }: Props) {
  return (
    <section className={`page-hero u-on-dark ${image ? 'page-hero--image' : ''}`}>
      {image ? (
        <div className="page-hero__media" aria-hidden="true">
          <picture>
            <source srcSet={images[image].webp} type="image/webp" />
            <img
              src={images[image].jpg}
              alt=""
              width={images[image].width}
              height={images[image].height}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
      ) : null}

      <div className="page-hero__inner u-container">
        <Breadcrumbs trail={trail} />
        <h1 className="page-hero__title">{title}</h1>
        {lede ? <p className="page-hero__lede">{lede}</p> : null}
        {children ? <div className="page-hero__extra">{children}</div> : null}
      </div>
    </section>
  )
}
