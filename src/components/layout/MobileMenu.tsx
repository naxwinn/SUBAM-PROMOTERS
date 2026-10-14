import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'

import StaggeredMenu from '@/components/StaggeredMenu'
import { logo } from '@/lib/assets'
import { primaryNav, socialLinks } from '@/lib/site'

import './mobile-menu.css'

/**
 * Mobile navigation, wrapping the React Bits StaggeredMenu.
 *
 * THE BUG THIS FIXES
 * ------------------
 * The previous panel was a `position: fixed` child of `<header>`. Once the
 * header gained `backdrop-filter: blur(10px)` on scroll, that filter created a
 * containing block for fixed descendants, so the panel stopped resolving
 * against the viewport and resolved against the 64px header box instead.
 * Measured: 600px tall at the top of the page, 68px after scrolling — a
 * scroll window two links high, with the rest unreachable.
 *
 * The structural fix is this portal. Rendering into document.body puts the
 * overlay outside the header entirely, so no ancestor filter, transform or
 * `overflow: hidden` can ever contain or clip it again.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollYRef = useRef(0)
  /* Set when the panel is closing because a link was followed. Navigating must
     land at the top of the new page, not restore the previous page's offset. */
  const navigatingRef = useRef(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => setMounted(true), [])

  /** Drives the component through its own toggle, so its GSAP timeline runs. */
  const requestClose = useCallback(() => {
    const toggle = containerRef.current?.querySelector<HTMLButtonElement>('.sm-toggle')
    if (toggle && toggle.getAttribute('aria-expanded') === 'true') toggle.click()
  }, [])

  /*
    Background scroll lock.

    `overflow: hidden` on body is unreliable on iOS Safari, so the body is
    pinned with `position: fixed` and offset by the current scroll position.
    That genuinely stops the page moving behind the panel, and the offset is
    what lets the exact scroll position be restored on close rather than
    dumping the visitor back at the top.
  */
  useEffect(() => {
    if (!open) return

    scrollYRef.current = window.scrollY
    const { body } = document
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollYRef.current}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    return () => {
      Object.assign(body.style, previous)

      if (navigatingRef.current) {
        /* A route change is in flight. Restoring here would fight the router's
           own scroll-to-top and leave the new page part-way down. */
        navigatingRef.current = false
        return
      }

      /* `auto` so the restore is instant and never animated by Lenis. */
      window.scrollTo({ top: scrollYRef.current, behavior: 'auto' })
    }
  }, [open])

  /* Escape closes, and focus returns to the toggle. */
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      requestClose()
      containerRef.current?.querySelector<HTMLButtonElement>('.sm-toggle')?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, requestClose])

  /* Browser back/forward while the panel is open. In-panel links close
     themselves in the click handler below, so this rarely fires. */
  useEffect(() => {
    requestClose()
  }, [pathname, requestClose])

  /*
    The component renders plain anchors. Left alone they would trigger a full
    document load instead of a route change, so this hands the URL to the
    router and closes the panel. Capture phase, so it runs before the
    component's own handlers.
  */
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest('a')
    if (!anchor) return

    const href = anchor.getAttribute('href')
    if (!href || !href.startsWith('/')) return // external links behave normally

    event.preventDefault()
    navigatingRef.current = true
    requestClose()
    navigate(href)
  }

  if (!mounted) return null

  return createPortal(
    <div
      ref={containerRef}
      className={`mobile-menu-portal ${open ? 'is-open' : ''}`}
      onClickCapture={handleClick}
    >
      <StaggeredMenu
        position="right"
        isFixed
        closeOnClickAway
        changeMenuColorOnOpen
        displayItemNumbering={false}
        displaySocials={socialLinks.length > 0}
        items={primaryNav.map(item => ({
          label: item.label,
          link: item.to,
          ariaLabel: `Go to ${item.label}`,
        }))}
        socialItems={socialLinks}
        /* Brand surfaces, deepest last so the panel settles on midnight teal. */
        colors={['#063B3D', '#087E83', '#012224']}
        accentColor="#087E83"
        menuButtonColor="#D4AF6A"
        openMenuButtonColor="#D4AF6A"
        logoUrl={logo.webp}
        onMenuOpen={() => setOpen(true)}
        onMenuClose={() => setOpen(false)}
      />
    </div>,
    document.body,
  )
}
