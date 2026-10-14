import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import MobileMenu from '@/components/layout/MobileMenu'
import Button from '@/components/ui/Button'
import { logo } from '@/lib/assets'
import { company, primaryNav } from '@/lib/site'

import './header.css'

export default function Header() {
  const [stuck, setStuck] = useState(false)

  /* Background appears once the header leaves the top of the page. */
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${stuck ? 'is-stuck' : ''}`}>
      <div className="site-header__inner u-container">
        <Link to="/" className="brand" aria-label={`${company.name} — home`}>
          {/*
            The supplied logo is a JPEG with its own dark-teal field baked in.
            It is never recoloured or stretched: a circular mask isolates the
            approved mark, and the aspect ratio is fixed 1:1 with object-fit:
            contain so the artwork itself is untouched.
          */}
          <picture className="brand__mark">
            <source srcSet={logo.webp} type="image/webp" />
            <img src={logo.jpg} alt="" width={logo.width} height={logo.height} />
          </picture>
          <span className="brand__text">
            <span className="brand__name">SUBAM</span>
            <span className="brand__sub">PROMOTERS</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul className="site-nav__list">
            {primaryNav.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__cta">
          <Button to="/contact/" variant="gold">
            Discuss Your Project
          </Button>
        </div>

      </div>

      {/* Mobile navigation lives in a portal on <body>, not inside this
          header — see the note at the top of MobileMenu.tsx. */}
      <MobileMenu />
    </header>
  )
}
