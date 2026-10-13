import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import Button from '@/components/ui/Button'
import { logo } from '@/lib/assets'
import { company, primaryNav } from '@/lib/site'

import './header.css'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [stuck, setStuck] = useState(false)
  const { pathname } = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  /* Fallback for history navigation (back/forward) while the panel is open.
     The links themselves also close it on click, so this rarely fires. */
  useEffect(() => setOpen(false), [pathname])

  /* Background appears once the header leaves the top of the page. */
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* While the mobile panel is open: lock the body, trap Escape, restore focus. */
  useEffect(() => {
    if (!open) return

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

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

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(value => !value)}
        >
          <span className="menu-toggle__bars" data-open={open} aria-hidden="true">
            <span />
            <span />
          </span>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        className="mobile-menu"
        data-open={open}
        hidden={!open}
      >
        <nav aria-label="Primary, mobile">
          <ul className="mobile-menu__list">
            {primaryNav.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `mobile-menu__link ${isActive ? 'is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Button to="/contact/" variant="gold" size="lg" className="mobile-menu__cta">
          Discuss Your Project
        </Button>
      </div>
    </header>
  )
}
