/**
 * End-to-end verification against the built site.
 * Walks every route, captures console/page errors, checks navigation, the
 * mobile menu, the flip cards, the enquiry form and horizontal overflow.
 */
import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const SHOTS = 'scripts/shots'
await mkdir(SHOTS, { recursive: true })

const ROUTES = [
  ['/', 'home'],
  ['/about/', 'about'],
  ['/real-estate-promotion/', 'real-estate'],
  ['/digital-marketing/', 'digital-marketing'],
  ['/insights/', 'insights'],
  ['/insights/what-buyers-look-for-before-a-site-visit/', 'insight-article'],
  ['/contact/', 'contact'],
  ['/privacy-policy/', 'privacy'],
  ['/terms-and-conditions/', 'terms'],
  ['/this-page-does-not-exist/', '404'],
]

const results = []
const fail = (name, detail) => results.push({ ok: false, name, detail })
const pass = name => results.push({ ok: true, name })

const browser = await chromium.launch()

/* ---------- 1. Every route renders, with no console or page errors ---------- */
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await desktop.newPage()

const errors = []
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(`${page.url()} :: ${msg.text()}`)
})
page.on('pageerror', err => errors.push(`${page.url()} :: ${err.message}`))

for (const [route, name] of ROUTES) {
  const response = await page.goto(BASE + route, { waitUntil: 'networkidle' })
  const status = response?.status()

  const h1 = await page.locator('h1').first().textContent().catch(() => null)
  if (!h1) fail(`render ${route}`, 'no <h1> found')
  else pass(`render ${route} — "${h1.trim().slice(0, 52)}" (HTTP ${status})`)

  /* Horizontal overflow check — explicitly required by the brief. */
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (overflow > 1) fail(`no h-overflow ${route}`, `${overflow}px wider than viewport`)
  else pass(`no h-overflow ${route}`)

  /* Title + description must be route-specific. */
  const title = await page.title()
  const desc = await page
    .locator('meta[name="description"]')
    .getAttribute('content')
    .catch(() => null)
  if (!title || !desc) fail(`seo ${route}`, `title="${title}" desc="${desc}"`)
  else pass(`seo ${route}`)

  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false })
}

/* ---------- 2. Scrolling and parallax on the homepage ---------- */
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
const beforeY = await page.evaluate(() => {
  const img = document.querySelector('.hero__image')
  return img ? getComputedStyle(img).transform : null
})
await page.mouse.wheel(0, 1200)
await page.waitForTimeout(900)
const scrolled = await page.evaluate(() => window.scrollY)
const afterY = await page.evaluate(() => {
  const img = document.querySelector('.hero__image')
  return img ? getComputedStyle(img).transform : null
})

if (scrolled > 300) pass(`page scrolls (scrollY=${Math.round(scrolled)})`)
else fail('page scrolls', `scrollY only reached ${scrolled}`)

if (beforeY !== afterY) pass('hero parallax transform changes on scroll')
else fail('hero parallax', `transform unchanged (${afterY})`)

await page.screenshot({ path: `${SHOTS}/home-scrolled.png` })

/* ---------- 3. Division flip cards ---------- */
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.locator('#divisions').scrollIntoViewIfNeeded()
await page.waitForTimeout(600)

const toggles = page.locator('.division-card__toggle')
const toggleCount = await toggles.count()
if (toggleCount === 2) pass('two division cards render with flip controls')
else fail('division cards', `expected 2 toggles, found ${toggleCount}`)

if (toggleCount === 2) {
  await toggles.first().click()
  await page.waitForTimeout(700)
  const pressed = await toggles.first().getAttribute('aria-pressed')
  if (pressed === 'true') pass('flip toggle sets aria-pressed=true')
  else fail('flip toggle', `aria-pressed="${pressed}"`)

  /* The back-face CTA must navigate, not just re-flip the card.
     Wait for the flip spring to settle first — clicking a card that is still
     rotating hits a stale position, not the CTA. */
  const cta = page.locator('.division-card__cta').first()
  /* Poll the box from Node until it stops moving, rather than guessing a delay. */
  let prev = null
  for (let attempt = 0; attempt < 40; attempt++) {
    const box = await cta.boundingBox()
    if (
      box &&
      prev &&
      Math.abs(box.x - prev.x) < 0.5 &&
      Math.abs(box.y - prev.y) < 0.5 &&
      Math.abs(box.width - prev.width) < 0.5
    ) {
      break
    }
    prev = box
    await page.waitForTimeout(100)
  }
  if (await cta.isVisible()) {
    await cta.click()
    await page.waitForTimeout(800)
    if (page.url().includes('real-estate-promotion')) pass('back-face CTA navigates (no flip conflict)')
    else fail('back-face CTA', `url is ${page.url()}`)
  } else {
    fail('back-face CTA', 'not visible after flip')
  }
  await page.screenshot({ path: `${SHOTS}/divisions-flipped.png` })
}

/* ---------- 4. Header navigation ---------- */
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.locator('.site-nav__link', { hasText: 'Digital Marketing' }).click()
await page.waitForTimeout(700)
if (page.url().includes('/digital-marketing/')) pass('header nav navigates')
else fail('header nav', `landed on ${page.url()}`)

/* Anchor target must clear the sticky header. */
await page.goto(BASE + '/#divisions', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
const clearance = await page.evaluate(() => {
  const el = document.querySelector('#divisions')
  const header = document.querySelector('.site-header')
  if (!el || !header) return null
  return Math.round(el.getBoundingClientRect().top - header.getBoundingClientRect().height)
})
if (clearance === null) fail('anchor clearance', 'elements missing')
else if (clearance >= -2) pass(`anchor clears sticky header (${clearance}px below)`)
else fail('anchor clearance', `section sits ${clearance}px under the header`)

/* ---------- 4a. Back-face CTA must also activate from the keyboard ----------
   FlipCard's root handles Enter/Space with preventDefault(), which cancels the
   anchor's own activation unless the key is stopped at the link. */
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.locator('#divisions').scrollIntoViewIfNeeded()
await page.waitForTimeout(400)
await page.locator('.division-card__toggle').first().focus()
await page.keyboard.press('Enter')
await page.waitForTimeout(900)
for (let i = 0; i < 12; i++) {
  await page.keyboard.press('Shift+Tab')
  const cls = await page.evaluate(() => document.activeElement?.className?.toString?.() || '')
  if (cls.includes('division-card__cta')) break
}
const ctaFocused = await page.evaluate(
  () => document.activeElement?.className?.toString?.().includes('division-card__cta') ?? false,
)
if (ctaFocused) pass('back-face CTA is keyboard focusable')
else fail('CTA keyboard focus', 'could not reach the CTA by tabbing')

await page.keyboard.press('Enter')
await page.waitForTimeout(1000)
if (new URL(page.url()).pathname === '/real-estate-promotion/')
  pass('back-face CTA activates with Enter')
else fail('CTA keyboard activation', `url is ${page.url()}`)

/* ---------- 4b. Scroll position resets on every client-side navigation ----------
   Regression guard: Lenis keeps its own scroll value and re-applies it each
   frame, so a native window.scrollTo reset is reverted and the next page opens
   part-way down. Every navigation route is checked, not just the header nav. */
const NAV_PAGES = [
  ['Home', '/'],
  ['About Us', '/about/'],
  ['Real Estate', '/real-estate-promotion/'],
  ['Digital Marketing', '/digital-marketing/'],
  ['Insights', '/insights/'],
  ['Contact', '/contact/'],
]

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
for (let i = 0; i < NAV_PAGES.length; i++) {
  const [toName, toPath] = NAV_PAGES[(i + 1) % NAV_PAGES.length]
  await page.mouse.wheel(0, 2200)
  await page.waitForTimeout(850)
  await page.locator('.site-nav__link', { hasText: toName }).first().click()
  await page.waitForTimeout(1300)
  const y = Math.round(await page.evaluate(() => window.scrollY))
  const path = new URL(page.url()).pathname
  if (y <= 2 && path === toPath) pass(`scroll resets on nav to ${toName}`)
  else fail(`scroll reset ${toName}`, `landed at y=${y} on ${path}`)
}

/* Footer links, breadcrumbs and in-page cards use the same router, but check
   one of each in case a different link type behaves differently. */
await page.goto(BASE + '/insights/', { waitUntil: 'networkidle' })
await page.mouse.wheel(0, 2000)
await page.waitForTimeout(800)
await page.locator('.insights__read').first().click()
await page.waitForTimeout(1300)
let y = Math.round(await page.evaluate(() => window.scrollY))
if (y <= 2) pass('scroll resets opening an insight')
else fail('scroll reset insight', `landed at y=${y}`)

await page.mouse.wheel(0, 1600)
await page.waitForTimeout(800)
await page.locator('.breadcrumbs a', { hasText: 'Insights' }).first().click()
await page.waitForTimeout(1300)
y = Math.round(await page.evaluate(() => window.scrollY))
if (y <= 2) pass('scroll resets via breadcrumb')
else fail('scroll reset breadcrumb', `landed at y=${y}`)

await page.mouse.wheel(0, 1800)
await page.waitForTimeout(800)
/* Must be a route we are not already on — the breadcrumb step above lands on
   /insights/, and clicking a link to the current route is a no-op. */
await page.locator('.site-footer__col a', { hasText: 'About Us' }).first().click()
await page.waitForTimeout(1300)
y = Math.round(await page.evaluate(() => window.scrollY))
if (y <= 2) pass('scroll resets via footer link')
else fail('scroll reset footer link', `landed at y=${y}`)

/* The hash path must still land on the anchor, not the top. */
await page.goto(BASE + '/contact/', { waitUntil: 'networkidle' })
await page.locator('.site-nav__link', { hasText: 'Home' }).first().click()
await page.waitForTimeout(1000)
await page.locator('a[href="/#divisions"], .hero__actions a').nth(1).click()
await page.waitForTimeout(1600)
const anchorTop = await page.evaluate(() => {
  const el = document.querySelector('#divisions')
  const header = document.querySelector('.site-header')
  if (!el || !header) return null
  return Math.round(el.getBoundingClientRect().top - header.getBoundingClientRect().height)
})
if (anchorTop !== null && anchorTop >= -2 && anchorTop < 60)
  pass(`in-page anchor still lands on target (${anchorTop}px below header)`)
else fail('in-page anchor', `offset ${anchorTop}`)

/* ---------- 5. Enquiry form validation ---------- */
await page.goto(BASE + '/contact/', { waitUntil: 'networkidle' })
await page.locator('button[type="submit"]').click()
await page.waitForTimeout(400)
const fieldErrors = await page.locator('.field__error').count()
if (fieldErrors >= 3) pass(`form blocks empty submit (${fieldErrors} field errors shown)`)
else fail('form validation', `only ${fieldErrors} errors shown`)

const invalidFocused = await page.evaluate(
  () => document.activeElement?.getAttribute('aria-invalid') === 'true',
)
if (invalidFocused) pass('focus moves to first invalid field')
else fail('form focus', 'focus did not move to an invalid field')

await page.screenshot({ path: `${SHOTS}/contact-errors.png` })

/* ---------- 6. Mobile ---------- */
const mobile = await browser.newContext({ ...devices['iPhone 13'] })
const mp = await mobile.newPage()
mp.on('pageerror', err => errors.push(`mobile :: ${err.message}`))

for (const [route] of ROUTES.slice(0, 6)) {
  await mp.goto(BASE + route, { waitUntil: 'networkidle' })
  const overflow = await mp.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (overflow > 1) fail(`mobile h-overflow ${route}`, `${overflow}px`)
  else pass(`mobile no h-overflow ${route}`)
}

await mp.goto(BASE + '/', { waitUntil: 'networkidle' })
await mp.locator('.sm-toggle').click()
await mp.waitForTimeout(900)
const menuOpen = await mp.evaluate(() =>
  document.querySelector('.staggered-menu-wrapper')?.hasAttribute('data-open') ?? false,
)
if (menuOpen) pass('mobile menu opens')
else fail('mobile menu', 'panel did not become visible')
await mp.screenshot({ path: `${SHOTS}/mobile-menu.png` })

await mp.locator('.sm-panel-item', { hasText: /^Insights$/ }).first().click()
await mp.waitForTimeout(800)
const menuClosed = await mp.evaluate(() =>
  !document.querySelector('.staggered-menu-wrapper')?.hasAttribute('data-open'),
)
if (menuClosed && mp.url().includes('/insights/')) pass('mobile menu closes after navigation')
else fail('mobile menu close', `visible=${!menuClosed} url=${mp.url()}`)

/* Mobile navigation must also land at the top, and must release the body
   scroll lock the menu applied. Note: the Lenis scroll-restore bug this guards
   against was desktop-only — Lenis does not drive scrolling on a touch device —
   so this checks the mobile path on its own merits, not as a proxy for that. */
for (const [label, path] of [
  ['About Us', '/about/'],
  ['Real Estate', '/real-estate-promotion/'],
  ['Contact', '/contact/'],
]) {
  await mp.evaluate(() => window.scrollBy(0, 1800))
  await mp.waitForTimeout(600)
  await mp.locator('.sm-toggle').click()
  await mp.waitForTimeout(900)
  await mp.locator('.sm-panel-item', { hasText: new RegExp(`^${label}$`) }).first().click()
  await mp.waitForTimeout(1300)

  const y = Math.round(await mp.evaluate(() => window.scrollY))
  const locked = await mp.evaluate(() => document.body.style.overflow === 'hidden')
  const landed = new URL(mp.url()).pathname
  if (y <= 2 && landed === path && !locked) pass(`mobile scroll resets on nav to ${label}`)
  else fail(`mobile scroll reset ${label}`, `y=${y} path=${landed} bodyLocked=${locked}`)
}

/* Mobile page must scroll natively. */
await mp.goto(BASE + '/', { waitUntil: 'networkidle' })
await mp.evaluate(() => window.scrollTo(0, 1500))
await mp.waitForTimeout(500)
const mobileScroll = await mp.evaluate(() => window.scrollY)
if (mobileScroll > 500) pass(`mobile scrolls natively (scrollY=${Math.round(mobileScroll)})`)
else fail('mobile scroll', `scrollY=${mobileScroll}`)
await mp.screenshot({ path: `${SHOTS}/mobile-home.png`, fullPage: false })

/* ---------- 7. Reduced motion ---------- */
const reduced = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
})
const rp = await reduced.newPage()
rp.on('pageerror', err => errors.push(`reduced-motion :: ${err.message}`))
await rp.goto(BASE + '/', { waitUntil: 'networkidle' })
await rp.locator('#divisions').scrollIntoViewIfNeeded()
await rp.waitForTimeout(600)

const staticCards = await rp.locator('.division-static').count()
if (staticCards === 2) pass('reduced motion renders the static card equivalent')
else fail('reduced motion cards', `found ${staticCards} static cards`)

const rmVisible = await rp.locator('.services__item').first().isVisible()
if (rmVisible) pass('reduced motion keeps revealed content visible')
else fail('reduced motion content', 'service items hidden')
await rp.screenshot({ path: `${SHOTS}/reduced-motion.png` })

/* ---------- 8. Tablet ---------- */
const tablet = await browser.newContext({ ...devices['iPad (gen 7)'] })
const tp = await tablet.newPage()
await tp.goto(BASE + '/', { waitUntil: 'networkidle' })
const tabletOverflow = await tp.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
)
if (tabletOverflow > 1) fail('tablet h-overflow', `${tabletOverflow}px`)
else pass('tablet no h-overflow')
await tp.screenshot({ path: `${SHOTS}/tablet-home.png` })

await browser.close()

/* ---------- Report ---------- */
const failed = results.filter(r => !r.ok)
console.log('\n================ VERIFICATION ================')
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : ` — ${r.detail}`}`)

console.log(`\nconsole/page errors: ${errors.length}`)
for (const e of errors.slice(0, 15)) console.log('  !', e)

console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 || errors.length > 0 ? 1 : 0)
