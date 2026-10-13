import { Link } from 'react-router-dom'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import './button.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold'
type Size = 'md' | 'lg'

type BaseProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
}

type LinkProps = BaseProps & { to: string; href?: never }
type AnchorProps = BaseProps & { href: string; to?: never } & ComponentPropsWithoutRef<'a'>
type ButtonProps = BaseProps & { to?: never; href?: never } & ComponentPropsWithoutRef<'button'>

type Props = LinkProps | AnchorProps | ButtonProps

/**
 * One button, four weights. Gold is reserved for a single decisive action per
 * view so it stays an accent rather than a default.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: Props) {
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim()

  if ('to' in rest && rest.to) {
    const { to, ...linkRest } = rest as LinkProps
    return (
      <Link to={to} className={cls} {...linkRest}>
        {children}
      </Link>
    )
  }

  if ('href' in rest && rest.href) {
    return (
      <a className={cls} {...(rest as AnchorProps)}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={cls} {...(rest as ButtonProps)}>
      {children}
    </button>
  )
}
