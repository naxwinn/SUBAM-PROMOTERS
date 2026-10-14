/**
 * Mobile navigation verification — the scroll bug and the StaggeredMenu.
 * Run with the preview server up: npm run preview && node scripts/check-menu.mjs
 */
import { chromium, devices } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const b = await chromium.launch()
const results = []
const ok = n => results.push(['ok', n])
const bad = (n, d) => results.push(['BAD', `${n} — ${d}`])
const errors = []
const GOLD = /212,\s*175,\s*106/
const ASSET_SRC = /^\/assets\//

const PUBLIC = [
  ['Home', '/'],
  ['About Us', '/about/'],
  ['Real Estate', '/real-estate-promotion/'],
  ['Digital Marketing', '/digital-marketing/'],
  ['Insights', '/insights/'],
  ['Contact', '/contact/'],
]

const openMenu = async p => {
  await p.locator('.sm-toggle').click()
  await p.waitForTimeout(900)
}
const panelMetrics = p =>
  p.evaluate(() => {
    const panel = document.querySelector('.staggered-menu-panel')
    const wrap = document.querySelector('.staggered-menu-wrapper')
    const r = panel.getBoundingClientRect()
    return {
      top: Math.round(r.top),
      height: Math.round(r.height),
      clientHeight: panel.clientHeight,
      scrollHeight: panel.scrollHeight,
      viewportH: window.innerHeight,
      open: wrap.hasAttribute('data-open'),
      overflowY: getComputedStyle(panel).overflowY,
    }
  })

/* ================= The original bug: scrolled-page menu height ============= */
{
  const ctx = await b.newContext({ ...devices['iPhone 13'] })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  p.on('console', m => m.type() === 'error' && errors.push(m.text()))
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })

  await openMenu(p)
  const atTop = await panelMetrics(p)
  atTop.height >= atTop.viewportH - 2
    ? ok(`panel fills the viewport at scrollY 0 (${atTop.height}/${atTop.viewportH}px)`)
    : bad('panel height at top', `${atTop.height} of ${atTop.viewportH}`)
  await p.locator('.sm-toggle').click()
  await p.waitForTimeout(600)

  /* This is the regression that broke production: once the header gained
     backdrop-filter, the fixed panel resolved against the 64px header. */
  await p.evaluate(() => window.scrollTo(0, 1500))
  await p.waitForTimeout(700)
  const stuck = await p.evaluate(() =>
    document.querySelector('.site-header').classList.contains('is-stuck'),
  )
  stuck ? ok('header is in its sticky/backdrop-filter state') : bad('setup', 'header not stuck')

  await openMenu(p)
  const scrolled = await panelMetrics(p)
  scrolled.height >= scrolled.viewportH - 2
    ? ok(`panel still fills the viewport after scrolling 1500px (${scrolled.height}px) — bug fixed`)
    : bad('REGRESSION', `panel collapsed to ${scrolled.height}px of ${scrolled.viewportH}`)

  /* Panel must not be a descendant of the header any more. */
  const escaped = await p.evaluate(() => {
    const panel = document.querySelector('.staggered-menu-panel')
    return !document.querySelector('.site-header')?.contains(panel)
  })
  escaped ? ok('panel is portalled outside the header') : bad('portal', 'panel still inside header')

  await ctx.close()
}

/* ================= Scrolling inside the open menu ========================= */
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 480 }, hasTouch: true, isMobile: true })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(`short: ${e.message}`))
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  await openMenu(p)

  const m = await panelMetrics(p)
  m.overflowY === 'auto' ? ok('panel is its own scroll container') : bad('overflow', m.overflowY)
  const scrollable = m.scrollHeight > m.clientHeight
  ok(`short viewport 390x480: content ${m.scrollHeight}px in ${m.clientHeight}px (${scrollable ? 'scrolls' : 'fits'})`)

  const pageBefore = await p.evaluate(() => window.scrollY)
  await p.evaluate(() => {
    const panel = document.querySelector('.staggered-menu-panel')
    panel.scrollTop = panel.scrollHeight
  })
  await p.waitForTimeout(500)
  const panelScrolled = await p.evaluate(() => document.querySelector('.staggered-menu-panel').scrollTop)
  const pageAfter = await p.evaluate(() => window.scrollY)

  if (!scrollable) ok('last item reachable without scrolling at this height')
  else if (panelScrolled > 0) ok(`menu scrolled internally to ${panelScrolled}px`)
  else bad('internal scroll', 'panel did not scroll')

  pageAfter === pageBefore
    ? ok('scrolling the menu does not move the page behind it')
    : bad('scroll bleed', `page moved ${pageBefore} -> ${pageAfter}`)

  /* Last nav item and socials must be inside the scrolled viewport. */
  const reach = await p.evaluate(() => {
    const links = [...document.querySelectorAll('.sm-panel-item')]
    const last = links[links.length - 1].getBoundingClientRect()
    const social = document.querySelector('.sm-socials-link')?.getBoundingClientRect()
    return {
      lastVisible: last.top >= 0 && last.bottom <= window.innerHeight + 1,
      socialVisible: social ? social.top >= 0 && social.bottom <= window.innerHeight + 1 : null,
    }
  })
  reach.lastVisible ? ok('last navigation item is reachable') : bad('last item', 'not reachable after scrolling')
  reach.socialVisible === null
    ? ok('no socials rendered')
    : reach.socialVisible
      ? ok('social link reachable at the bottom of the menu')
      : bad('socials', 'not reachable')

  /* Close control stays on screen while scrolled. */
  const toggleVisible = await p.evaluate(() => {
    const r = document.querySelector('.sm-toggle').getBoundingClientRect()
    return r.top >= 0 && r.bottom <= window.innerHeight
  })
  toggleVisible ? ok('close control stays visible while the list is scrolled') : bad('close control', 'off screen')

  await p.locator('.sm-toggle').click()
  await p.waitForTimeout(700)
  const closed = await p.evaluate(() => !document.querySelector('.staggered-menu-wrapper').hasAttribute('data-open'))
  closed ? ok('closes from the scrolled position') : bad('close', 'still open')
  await ctx.close()
}

/* ================= Scroll lock + position restore ========================= */
{
  const ctx = await b.newContext({ ...devices['iPhone 13'] })
  const p = await ctx.newPage()
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  await p.evaluate(() => window.scrollTo(0, 1200))
  await p.waitForTimeout(600)
  const before = await p.evaluate(() => window.scrollY)

  await openMenu(p)
  const locked = await p.evaluate(() => getComputedStyle(document.body).position === 'fixed')
  locked ? ok('page scroll is locked while the menu is open') : bad('scroll lock', 'body not pinned')

  await p.locator('.sm-toggle').click()
  await p.waitForTimeout(900)
  const after = await p.evaluate(() => window.scrollY)
  const unlocked = await p.evaluate(() => getComputedStyle(document.body).position !== 'fixed')
  unlocked ? ok('scroll lock released on close') : bad('scroll lock', 'page left locked')
  Math.abs(after - before) <= 2
    ? ok(`scroll position restored (${before} -> ${after})`)
    : bad('scroll restore', `${before} -> ${after}`)

  /* Opening and closing repeatedly must not leave the page stuck. */
  for (let i = 0; i < 3; i++) {
    await p.locator('.sm-toggle').click()
    await p.waitForTimeout(120)
    await p.locator('.sm-toggle').click()
    await p.waitForTimeout(120)
  }
  await p.waitForTimeout(900)
  const stillUnlocked = await p.evaluate(() => getComputedStyle(document.body).position !== 'fixed')
  const canScroll = await p.evaluate(() => {
    window.scrollTo(0, 800)
    return window.scrollY
  })
  stillUnlocked && canScroll > 100
    ? ok('rapid open/close leaves the page scrollable')
    : bad('rapid toggle', `locked=${!stillUnlocked} scrollY=${canScroll}`)
  await ctx.close()
}

/* ================= Every link navigates and closes ======================== */
{
  const ctx = await b.newContext({ ...devices['iPhone 13'] })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(`nav: ${e.message}`))

  const labels = await (async () => {
    await p.goto(BASE + '/', { waitUntil: 'networkidle' })
    await openMenu(p)
    const l = await p.$$eval('.sm-panel-item .sm-panel-itemLabel', els => els.map(e => e.textContent.trim()))
    await p.locator('.sm-toggle').click()
    await p.waitForTimeout(500)
    return l
  })()

  JSON.stringify(labels) === JSON.stringify(PUBLIC.map(x => x[0]))
    ? ok(`menu lists exactly the public pages: ${labels.join(', ')}`)
    : bad('menu items', JSON.stringify(labels))
  labels.some(l => /our work/i.test(l)) ? bad('menu items', 'Our Work present') : ok('Our Work absent from the menu')

  for (const [label, path] of PUBLIC) {
    await p.goto(BASE + '/', { waitUntil: 'networkidle' })
    await p.evaluate(() => window.scrollTo(0, 900))
    await p.waitForTimeout(400)
    await openMenu(p)
    await p.locator('.sm-panel-item', { hasText: new RegExp(`^${label}$`) }).first().click()
    await p.waitForTimeout(1300)

    const landed = new URL(p.url()).pathname
    const stillOpen = await p.evaluate(() =>
      document.querySelector('.staggered-menu-wrapper')?.hasAttribute('data-open'),
    )
    const bodyFixed = await p.evaluate(() => getComputedStyle(document.body).position === 'fixed')
    landed === path && !stillOpen && !bodyFixed
      ? ok(`${label} -> ${path}, menu closed, scroll released`)
      : bad(`${label}`, `landed=${landed} open=${stillOpen} locked=${bodyFixed}`)
  }
  await ctx.close()
}

/* ================= Keyboard, Escape, accessibility ======================== */
{
  const ctx = await b.newContext({ viewport: { width: 420, height: 800 } })
  const p = await ctx.newPage()
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })

  const collapsed = await p.locator('.sm-toggle').getAttribute('aria-expanded')
  collapsed === 'false' ? ok('aria-expanded is false when closed') : bad('aria-expanded', String(collapsed))

  const hiddenWhenClosed = await p.evaluate(() => {
    const panel = document.querySelector('.staggered-menu-panel')
    return panel.getAttribute('aria-hidden') === 'true' && getComputedStyle(panel).visibility === 'hidden'
  })
  hiddenWhenClosed
    ? ok('closed panel is aria-hidden and visually hidden (not focusable)')
    : bad('closed panel', 'still exposed')

  await openMenu(p)
  const expanded = await p.locator('.sm-toggle').getAttribute('aria-expanded')
  expanded === 'true' ? ok('aria-expanded is true when open') : bad('aria-expanded', String(expanded))

  const name = await p.locator('.sm-toggle').getAttribute('aria-label')
  name && name.length > 3 ? ok(`toggle has an accessible name ("${name}")`) : bad('accessible name', String(name))

  /* :focus-visible only matches keyboard focus — a programmatic .focus() does
     not qualify, so the ring must be measured after a real Tab. */
  let focusRing = 'not-reached'
  for (let i = 0; i < 10; i++) {
    await p.keyboard.press('Tab')
    const hit = await p.evaluate(() => document.activeElement?.classList.contains('sm-panel-item'))
    if (hit) {
      focusRing = await p.evaluate(() => getComputedStyle(document.activeElement).outlineColor)
      break
    }
  }
  GOLD.test(focusRing) ? ok('menu links show a gold focus ring') : bad('focus ring', focusRing)

  await p.keyboard.press('Escape')
  await p.waitForTimeout(800)
  const escClosed = await p.evaluate(() => !document.querySelector('.staggered-menu-wrapper').hasAttribute('data-open'))
  escClosed ? ok('Escape closes the menu') : bad('Escape', 'menu stayed open')

  const focusBack = await p.evaluate(() => document.activeElement?.classList.contains('sm-toggle'))
  focusBack ? ok('focus returns to the toggle after Escape') : bad('focus restore', 'focus not on toggle')

  const touch = await p.evaluate(() => {
    const r = document.querySelector('.sm-toggle').getBoundingClientRect()
    return { w: Math.round(r.width), h: Math.round(r.height) }
  })
  touch.w >= 44 && touch.h >= 44
    ? ok(`toggle touch target ${touch.w}x${touch.h} (>= 44x44)`)
    : bad('touch target', `${touch.w}x${touch.h}`)
  await ctx.close()
}

/* ================= Floating buttons, overflow, logo, palette ============== */
for (const [label, opts] of [
  ['portrait 390x844', { ...devices['iPhone 13'] }],
  ['landscape 844x390', { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true }],
  ['small 320x568', { viewport: { width: 320, height: 568 }, hasTouch: true, isMobile: true }],
  ['tablet', { ...devices['iPad (gen 7)'] }],
]) {
  const ctx = await b.newContext(opts)
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(`${label}: ${e.message}`))
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  await openMenu(p)

  const ovf = await p.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  ovf <= 1 ? ok(`${label}: no horizontal overflow with the menu open`) : bad(label, `overflow ${ovf}px`)

  /* The overlay must sit above the floating contact buttons. */
  const above = await p.evaluate(() => {
    const fab = document.querySelector('.fcb__btn--whatsapp')
    if (!fab) return 'no-fab'
    const r = fab.getBoundingClientRect()
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
    return hit && !fab.contains(hit) && hit !== fab
  })
  above === 'no-fab'
    ? ok(`${label}: no floating buttons present`)
    : above
      ? ok(`${label}: menu covers the floating contact buttons`)
      : bad(label, 'floating buttons sit above the open menu')

  /* Approved logo must not be inverted by the demo CSS. */
  const logoState = await p.evaluate(() => {
    const img = document.querySelector('.sm-logo-img')
    if (!img) return null
    const cs = getComputedStyle(img)
    return { filter: cs.filter, w: Math.round(img.getBoundingClientRect().width), h: Math.round(img.getBoundingClientRect().height), src: img.getAttribute('src') }
  })
  if (!logoState) bad(label, 'logo missing from the menu header')
  else {
    logoState.filter === 'none' ? ok(`${label}: logo not inverted`) : bad(label, `logo filter ${logoState.filter}`)
    logoState.w === logoState.h ? ok(`${label}: logo square ${logoState.w}px`) : bad(label, `logo ${logoState.w}x${logoState.h}`)
    const srcOk = ASSET_SRC.test(logoState.src ?? '') || (logoState.src ?? '').includes('logo')
    srcOk
      ? ok(`${label}: uses the approved SUBAM logo`)
      : bad(label, `logo src ${logoState.src}`)
  }

  const panelBg = await p.evaluate(
    () => getComputedStyle(document.querySelector('.staggered-menu-panel')).backgroundColor,
  )
  panelBg === 'rgb(1, 34, 36)' ? ok(`${label}: panel uses midnight teal`) : bad(label, `panel bg ${panelBg}`)

  await p.screenshot({ path: `scripts/shots/menu-${label.replace(/\W/g, '')}.png` })
  await ctx.close()
}

/* ================= Desktop untouched ====================================== */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(`desktop: ${e.message}`))
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  const toggleHidden = await p.evaluate(() => {
    const portal = document.querySelector('.mobile-menu-portal')
    return !portal || getComputedStyle(portal).display === 'none'
  })
  toggleHidden ? ok('desktop: mobile menu hidden') : bad('desktop', 'mobile toggle visible at 1440px')

  const navLinks = await p.$$eval('.site-nav__link', els => els.map(e => e.textContent.trim()))
  navLinks.length === 6 ? ok(`desktop nav intact (${navLinks.join(', ')})`) : bad('desktop nav', JSON.stringify(navLinks))

  const brandLogo = await p.evaluate(() => {
    const img = document.querySelector('.brand__mark img')
    return img ? getComputedStyle(img).filter : null
  })
  brandLogo === 'none' ? ok('desktop: header logo unmodified') : bad('desktop logo', String(brandLogo))
  await ctx.close()
}

/* ================= Reduced motion ========================================= */
{
  const ctx = await b.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(`reduced: ${e.message}`))
  await p.goto(BASE + '/', { waitUntil: 'networkidle' })
  await p.locator('.sm-toggle').click()
  await p.waitForTimeout(260) // deliberately less than the 0.65s open animation
  const openFast = await p.evaluate(() => {
    const panel = document.querySelector('.staggered-menu-panel')
    return panel.getBoundingClientRect().left < 10
  })
  openFast ? ok('reduced motion: panel lands immediately') : bad('reduced motion', 'still animating in')

  const itemClickable = await p.locator('.sm-panel-item').first().isVisible()
  itemClickable ? ok('reduced motion: links usable without waiting for animation') : bad('reduced motion', 'links not ready')
  await ctx.close()
}

await b.close()
for (const [s, n] of results) console.log(`${s.padEnd(4)} ${n}`)
console.log(`\nconsole/page errors: ${errors.length}`)
errors.slice(0, 8).forEach(e => console.log('  !', e))
const fails = results.filter(r => r[0] === 'BAD').length
console.log(`${results.length - fails}/${results.length} passed`)
process.exit(fails || errors.length ? 1 : 0)
