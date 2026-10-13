import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

/** Gap left above an anchored section so the sticky header never covers it. */
const ANCHOR_GAP = 24

/**
 * Drives Lenis from GSAP's ticker so smooth scrolling and ScrollTrigger share a
 * single RAF loop. Mounted once, at the app root.
 *
 * Deliberately conservative:
 * - Native touch scrolling is left alone (`syncTouch` stays off), so mobile
 *   never feels hijacked.
 * - Reduced-motion users get the browser's own scrolling, untouched.
 * - Everything is torn down on unmount, so React StrictMode's double-invoke
 *   cannot leave a second loop or a duplicate ticker callback behind.
 */
export default function SmoothScroll() {
  const { pathname, hash } = useLocation()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      duration: 1.05,
      // Gentle exponential ease-out; no overshoot, so reading position stays predictable.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Leave touch scrolling to the browser.
      syncTouch: false,
    })
    lenisRef.current = lenis

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    lenis.on('scroll', ScrollTrigger.update)
    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  /*
    Route changes start at the top; in-page hashes resolve to their target.

    This must go through Lenis rather than window.scrollTo. Lenis holds its own
    `animatedScroll` value and writes it to the window every animation frame, so
    a native scroll reset is silently reverted on the next frame and the new page
    opens at the old scroll position.
  */
  useEffect(() => {
    const lenis = lenisRef.current
    const reduced = prefersReducedMotion()

    if (hash) {
      const target = document.querySelector<HTMLElement>(hash)
      if (target) {
        if (lenis) {
          const headerHeight =
            document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0
          /*
            An absolute position, not an element + offset. The browser has
            already performed its own fragment jump honouring scroll-margin-top
            by this point; passing the element to Lenis would apply the header
            clearance a second time on top of that. `top + scrollY` is the same
            number whatever the current scroll position, so this lands correctly
            either way.
          */
          const top =
            target.getBoundingClientRect().top + window.scrollY - headerHeight - ANCHOR_GAP
          lenis.scrollTo(Math.max(0, top), { immediate: reduced })
        } else {
          target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
        }
        return
      }
    }

    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)

    /* Layout changed under ScrollTrigger — recompute every start/end. */
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [pathname, hash])

  return null
}
