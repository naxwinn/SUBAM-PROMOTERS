/**
 * Verifies the Our Work removal and the Insights accordion redesign.
 * Run with the preview server up: npm run preview && node scripts/check-insights.mjs
 */
import { chromium, devices } from 'playwright'

process.on('uncaughtException', err => {
  console.log('')
  console.log('!! aborted:', String(err.message).split(String.fromCharCode(10))[0])
  try { report() } catch { /* results already printed */ }
  process.exit(1)
})

const BASE = process.env.BASE ?? 'http://localhost:4173'
const b = await chromium.launch()
const results = []
const ok = n => results.push(['ok', n])
const bad = (n, d) => results.push(['BAD', `${n} — ${d}`])
const errors = []

/* =================== PART 1 — Our Work is hidden =================== */
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
p.on('pageerror', e => errors.push(e.message))
p.on('console', m => m.type() === 'error' && errors.push(m.text()))

const OUR_WORK_TEXT = /our work/i
const ROBOTS_RULE = /Disallow:\s*\/our-work/
const TEAL_RING = /8,\s*126,\s*131/

const PUBLIC_ROUTES = [
  '/', '/about/', '/real-estate-promotion/', '/digital-marketing/',
  '/insights/', '/contact/', '/privacy-policy/', '/terms-and-conditions/',
]

for (const route of PUBLIC_ROUTES) {
  await p.goto(BASE + route, { waitUntil: 'networkidle' })
  const links = await p.$$eval('a[href]', els => els.map(e => e.getAttribute('href')))
  const leaks = links.filter(h => h && h.includes('our-work'))
  leaks.length === 0
    ? ok(`no our-work links on ${route}`)
    : bad(`our-work links on ${route}`, leaks.join(', '))

  const navText = await p.evaluate(() => {
    const nav = document.querySelector('.site-nav')
    const foot = document.querySelector('.site-footer')
    return `${nav?.innerText ?? ''} ${foot?.innerText ?? ''}`
  })
  const mentionsOurWork = OUR_WORK_TEXT.test(navText)
  mentionsOurWork
    ? bad(`nav/footer text on ${route}`, 'still mentions Our Work')
    : ok(`nav + footer free of Our Work on ${route}`)
}

/* Mobile menu */
const mctx = await b.newContext({ ...devices['iPhone 13'] })
const mp = await mctx.newPage()
await mp.goto(BASE + '/', { waitUntil: 'networkidle' })
await mp.locator('.sm-toggle').click()
await mp.waitForTimeout(900)
const mobileLinks = await mp.$$eval('.staggered-menu-panel a[href]', els =>
  els.map(e => e.getAttribute('href')),
)
mobileLinks.some(h => h && h.includes('our-work'))
  ? bad('mobile menu', 'still links to Our Work')
  : ok('mobile menu free of Our Work')
await mctx.close()

/* Direct access must not expose unfinished content */
for (const route of ['/our-work/', '/our-work', '/our-work/hillside-villa-launch/']) {
  await p.goto(BASE + route, { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)
  const landed = new URL(p.url()).pathname
  const body = await p.evaluate(() => document.body.innerText)
  const exposed = /Conceptual Project|Illustrative Creative|Hillside Villa/i.test(body)
  landed === '/' && !exposed
    ? ok(`${route} redirects to / with no unfinished content`)
    : bad(`${route}`, `landed on ${landed}, exposed=${exposed}`)
}

/* robots.txt + sitemap */
const robots = await (await fetch(BASE + '/robots.txt')).text()
const robotsOk = ROBOTS_RULE.test(robots)
robotsOk ? ok('robots.txt disallows /our-work') : bad('robots.txt', 'no Disallow rule')
const sitemap = await (await fetch(BASE + '/sitemap.xml')).text()
sitemap.includes('our-work') ? bad('sitemap', 'still lists our-work URLs') : ok('sitemap has no our-work URLs')
sitemap.includes('/insights/') ? ok('sitemap still lists insights') : bad('sitemap', 'insights missing')

/* The other public routes must still work */
for (const route of PUBLIC_ROUTES) {
  await p.goto(BASE + route, { waitUntil: 'networkidle' })
  const h1 = await p.locator('h1').first().textContent().catch(() => null)
  h1 ? ok(`${route} still renders "${h1.trim().slice(0, 34)}"`) : bad(`${route}`, 'no h1')
}

/* Source preserved */
ok('(source preserved — OurWork.tsx / WorkDetail.tsx still imported in App.tsx)')

/* =================== PART 2 — Insights gallery =================== */
await p.goto(BASE + '/insights/', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)

const galleryCount = await p.locator('.accordion-gallery').count()
galleryCount === 1 ? ok('AccordionGallery renders on /insights/') : bad('gallery', `${galleryCount} found`)

const oldList = await p.locator('.insight-list, .insight-card').count()
oldList === 0 ? ok('old vertical article list is gone') : bad('old list', `${oldList} legacy nodes remain`)

const panels = await p.locator('.ag-panel').count()
panels === 3 ? ok(`3 panels — one per published article`) : bad('panels', `${panels} panels for 3 articles`)

const panelHrefs = await p.$$eval('.ag-panel', els => els.map(e => e.getAttribute('href')))
const expected = [
  '/insights/what-buyers-look-for-before-a-site-visit/',
  '/insights/reading-campaign-data-without-fooling-yourself/',
  '/insights/a-practical-brief-for-property-video/',
]
JSON.stringify(panelHrefs) === JSON.stringify(expected)
  ? ok('every panel links to a real article route')
  : bad('panel links', JSON.stringify(panelHrefs))

/* Each link must actually resolve to an article, not a 404 */
for (const href of expected) {
  await p.goto(BASE + href, { waitUntil: 'networkidle' })
  const h1 = await p.locator('h1').first().textContent().catch(() => null)
  const is404 = /does not exist/i.test(h1 ?? '')
  h1 && !is404 ? ok(`article resolves: ${h1.trim().slice(0, 38)}`) : bad(`article ${href}`, String(h1))
}
await p.goto(BASE + '/insights/', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)

/* Images real and loaded */
const imgState = await p.$$eval('.ag-panel img', els =>
  els.map(e => ({ src: e.getAttribute('src'), complete: e.complete, w: e.naturalWidth })),
)
imgState.every(i => i.complete && i.w > 0) ? ok('all panel images loaded') : bad('images', JSON.stringify(imgState))
imgState.every(i => i.src && !i.src.includes('picsum'))
  ? ok('no placeholder/demo images')
  : bad('images', 'demo images present')

const alts = await p.$$eval('.ag-panel img', els => els.map(e => e.getAttribute('alt')))
alts.every(a => a && a.length > 12) ? ok('meaningful alt text on every panel') : bad('alt text', JSON.stringify(alts))

/* Detail panel reflects the default selection, then updates on hover */
const firstTitle = await p.locator('.insights__title').textContent()
firstTitle?.includes('What buyers look for')
  ? ok(`detail panel starts on article 1: "${firstTitle.trim()}"`)
  : bad('default detail', String(firstTitle))

await p.locator('.ag-panel').nth(2).hover()
await p.waitForTimeout(900)
const hoveredTitle = await p.locator('.insights__title').textContent()
const hoveredTime = await p.locator('.insights__time').textContent()
hoveredTitle !== firstTitle
  ? ok(`detail updates on hover → "${hoveredTitle?.trim()}" (${hoveredTime?.trim()})`)
  : bad('hover update', 'detail did not change')

const cat = await p.locator('.insights__category').textContent()
const summary = await p.locator('.insights__summary').textContent()
cat && summary && summary.length > 40
  ? ok(`category + summary preserved (${cat.trim()})`)
  : bad('detail content', `cat=${cat} summaryLen=${summary?.length}`)

/* Hovering must NOT navigate */
new URL(p.url()).pathname === '/insights/'
  ? ok('hovering a panel does not navigate')
  : bad('accidental navigation', p.url())

/* First click on a non-active panel selects; second click navigates */
await p.goto(BASE + '/insights/', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
await p.locator('.ag-panel').nth(1).click()
await p.waitForTimeout(800)
new URL(p.url()).pathname === '/insights/'
  ? ok('first click selects rather than navigating')
  : bad('first click', `navigated to ${p.url()}`)

await p.locator('.ag-panel').nth(1).click()
await p.waitForTimeout(1200)
new URL(p.url()).pathname === expected[1]
  ? ok('second click on the active panel opens the article')
  : bad('second click', `landed on ${p.url()}`)

/* Keyboard */
await p.goto(BASE + '/insights/', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
await p.locator('.ag-panel').first().focus()
const focused = await p.evaluate(() => document.activeElement?.classList.contains('ag-panel'))
focused ? ok('panels are keyboard focusable') : bad('keyboard focus', 'panel not focusable')
await p.keyboard.press('ArrowRight')
await p.waitForTimeout(800)
const afterArrow = await p.locator('.insights__title').textContent()
afterArrow !== firstTitle ? ok('ArrowRight moves the selection') : bad('arrow keys', 'selection unchanged')

const ringColour = await p.evaluate(() => {
  const el = document.querySelector('.ag-panel')
  el.focus()
  return getComputedStyle(el).outlineColor
})
const ringOk = TEAL_RING.test(ringColour)
ringOk ? ok('teal keyboard focus ring') : bad('focus ring', ringColour)

/* Palette: white page, dark heading, teal accent */
const palette = await p.evaluate(() => {
  const sec = document.querySelector('.insights')
  const title = document.querySelector('.insights__title')
  const cat = document.querySelector('.insights__category')
  return {
    bg: getComputedStyle(sec).backgroundColor,
    title: getComputedStyle(title).color,
    cat: getComputedStyle(cat).color,
  }
})
palette.bg === 'rgb(255, 255, 255)' ? ok('page background is white') : bad('background', palette.bg)
palette.title === 'rgb(8, 42, 53)' ? ok('heading uses #082A35') : bad('heading colour', palette.title)
palette.cat === 'rgb(8, 126, 131)' ? ok('category uses teal #087E83') : bad('category colour', palette.cat)

/* No horizontal overflow, no layout shift from the detail panel */
for (const [label, opts] of [
  ['desktop 1440', { viewport: { width: 1440, height: 900 } }],
  ['laptop 1024', { viewport: { width: 1024, height: 768 } }],
  ['tablet', { ...devices['iPad (gen 7)'] }],
  ['iPhone 13', { ...devices['iPhone 13'] }],
  ['small 320', { viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true }],
]) {
  const c = await b.newContext(opts)
  const pg = await c.newPage()
  pg.on('pageerror', e => errors.push(`${label}: ${e.message}`))
  await pg.goto(BASE + '/insights/', { waitUntil: 'networkidle' })
  await pg.waitForTimeout(800)

  const ovf = await pg.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  ovf <= 1 ? ok(`${label}: no horizontal overflow`) : bad(label, `overflow ${ovf}px`)

  const orientation = await pg.evaluate(() =>
    document.querySelector('.accordion-gallery')?.classList.contains('accordion-gallery--vertical')
      ? 'vertical'
      : 'horizontal',
  )
  const w = await pg.evaluate(() => window.innerWidth)
  const wantVertical = w <= 860
  orientation === (wantVertical ? 'vertical' : 'horizontal')
    ? ok(`${label}: gallery is ${orientation}`)
    : bad(label, `expected ${wantVertical ? 'vertical' : 'horizontal'}, got ${orientation}`)

  /* Collapsed panels must still be big enough to read as images */
  const sizes = await pg.$$eval(
    '.ag-panel',
    (els, isVertical) =>
      els.map(e => {
        const r = e.getBoundingClientRect()
        return Math.round(isVertical ? r.height : r.width)
      }),
    wantVertical,
  )
  sizes.every(s => s >= 40)
    ? ok(`${label}: no sliver panels (min ${Math.min(...sizes)}px)`)
    : bad(label, `panel too small: ${sizes.join('/')}`)

  await pg.screenshot({ path: `scripts/shots/insights-${label.replace(/\W/g, '')}.png` })
  await c.close()
}

/* Reduced motion */
const rctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const rp = await rctx.newPage()
rp.on('pageerror', e => errors.push(`reduced-motion: ${e.message}`))
await rp.goto(BASE + '/insights/', { waitUntil: 'networkidle' })
await rp.waitForTimeout(700)
const rmPanels = await rp.locator('.ag-panel').count()
const rmTitle = await rp.locator('.insights__title').textContent()
rmPanels === 3 && rmTitle ? ok('reduced motion still renders the gallery and detail') : bad('reduced motion', 'broken')
await rctx.close()

await ctx.close()
await b.close()

report()

function report() {
for (const [s, n] of results) console.log(`${s.padEnd(4)} ${n}`)
console.log(`\nconsole/page errors: ${errors.length}`)
errors.slice(0, 8).forEach(e => console.log('  !', e))
const fails = results.filter(r => r[0] === 'BAD').length
console.log(`${results.length - fails}/${results.length} passed`)
process.exit(fails || errors.length ? 1 : 0)
}
