import type { ReactNode } from 'react'

import './section.css'

type Tone = 'page' | 'soft' | 'mid' | 'dark'

type SectionProps = {
  children: ReactNode
  tone?: Tone
  id?: string
  className?: string
  /** Draws a gold hairline across the top edge — used at major transitions only. */
  ruled?: boolean
}

export function Section({ children, tone = 'page', id, className = '', ruled = false }: SectionProps) {
  const dark = tone === 'dark' || tone === 'mid'
  return (
    <section
      id={id}
      className={`section section--${tone} ${ruled ? 'section--ruled' : ''} ${
        dark ? 'u-on-dark' : ''
      } ${className}`.trim()}
    >
      <div className="u-container">{children}</div>
    </section>
  )
}

type HeadProps = {
  title: string
  lede?: string
  /** Short contextual line. Not a decorative label — say something real or omit it. */
  kicker?: string
  align?: 'start' | 'center'
  as?: 'h1' | 'h2'
  className?: string
}

export function SectionHead({
  title,
  lede,
  kicker,
  align = 'start',
  as: Tag = 'h2',
  className = '',
}: HeadProps) {
  return (
    <header className={`section-head section-head--${align} ${className}`.trim()}>
      {kicker ? <p className="section-head__kicker">{kicker}</p> : null}
      <Tag className="section-head__title">{title}</Tag>
      {lede ? <p className="section-head__lede">{lede}</p> : null}
    </header>
  )
}
