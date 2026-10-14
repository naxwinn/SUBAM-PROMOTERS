/**
 * Checks for the floating contact buttons and the site-wide contact details.
 * Run with the preview server up: npm run preview && node scripts/check-fabs.mjs
 */
import { chromium, devices } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const INSTAGRAM = 'https://instagram.com/subampromoters?obrf=amk4MjNtamJjMXl0'
const NUMBER = '917603976398'
const EMAIL = 'subampromoters.ventures@gmail.com'
const PHONE_DISPLAY = '+91 7603 976 398'

const b = await chromium.launch()
const results = []
const ok = n => results.push(['ok', n])
const bad = (n, d) => results.push(['BAD', `${n} — ${d}`])
const overlaps = (a, c) =>
  a && c && a.x < c.x + c.width && a.x + a.width > c.x && a.y < c.y + c.height && a.y + a.height > c.y

/* ---------- Links, labels, placement ---------- */
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
const errors = []
p.on('pageerror', e => errors.push(e.message))
p.on('console', m => m.type() === 'error' && errors.push(m.text()))
await p.goto(BASE + '/', { waitUntil: 'networkidle' })

const idsIn = sel =>
  p.$$eval(`${sel} .fcb__btn`, els =>
    els.map(e =>
      [...e.classList]
        .find(c => /^fcb__btn--(phone|whatsapp|instagram)$/.test(c))
        .replace('fcb__btn--', ''),
    ),
  )

const left = await idsIn('.fcb__list--left')
const right = await idsIn('.fcb__list--right')
JSON.stringify(left) === JSON.stringify(['phone', 'whatsapp'])
  ? ok(`bottom-left column: ${left.join(' → ')} (phone above WhatsApp)`)
  : bad('left column', JSON.stringify(left))
JSON.stringify(right) === JSON.stringify(['instagram'])
  ? ok('bottom-right corner: instagram')
  : bad('right column', JSON.stringify(right))

const vw = await p.evaluate(() => window.innerWidth)
const vh = await p.evaluate(() => window.innerHeight)
const phoneBox = await p.locator('.fcb__btn--phone').boundingBox()
const waBox = await p.locator('.fcb__btn--whatsapp').boundingBox()
const igBox = await p.locator('.fcb__btn--instagram').boundingBox()

phoneBox.y < waBox.y ? ok('phone sits above WhatsApp') : bad('left order', 'phone is not above WhatsApp')
phoneBox.x < vw / 2 && waBox.x < vw / 2 ? ok('left stack is on the left half') : bad('left side', 'not on the left')
igBox.x > vw / 2 ? ok('Instagram is on the right half') : bad('right side', 'not on the right')
waBox.y + waBox.height <= vh ? ok('bottom stack fits the viewport') : bad('left stack', 'extends past the fold')

const href = sel => p.locator(sel).getAttribute('href')
const ig = await href('.fcb__btn--instagram')
ig === INSTAGRAM ? ok('Instagram URL unchanged') : bad('Instagram URL', String(ig))

const wa = await href('.fcb__btn--whatsapp')
const expectedWa = `https://wa.me/${NUMBER}?text=${encodeURIComponent("Hi SUBAM PROMOTERS, I'm interested in your services.")}`
wa === expectedWa ? ok('WhatsApp wa.me URL with encoded message') : bad('WhatsApp URL', String(wa))

const tel = await href('.fcb__btn--phone')
tel === `tel:+${NUMBER}` ? ok(`phone uses tel: (${tel})`) : bad('tel href', String(tel))

const hrefs = await p.$$eval('.fcb__btn', els => els.map(e => e.getAttribute('href')))
hrefs.every(h => h && h !== '#' && !/undefined|null/.test(h))
  ? ok('no broken hrefs')
  : bad('hrefs', JSON.stringify(hrefs))

/* The nav spans the viewport for positioning — it must not swallow clicks. */
const blocked = await p.evaluate(() => {
  const points = [
    [window.innerWidth / 2, window.innerHeight / 2],
    [window.innerWidth / 2, 120],
    [200, window.innerHeight - 120],
  ]
  return points
    .map(([x, y]) => document.elementFromPoint(x, y))
    .filter(el => el && el.classList && el.classList.contains('fcb')).length
})
blocked === 0
  ? ok('full-viewport nav does not capture page clicks')
  : bad('pointer-events', `${blocked} sample points hit the nav`)

/* Prove it by actually clicking a page link through the overlay. */
await p.locator('.site-nav__link', { hasText: 'Insights' }).click()
await p.waitForTimeout(1200)
new URL(p.url()).pathname === '/insights/'
  ? ok('page links remain clickable beneath the overlay')
  : bad('click-through', `landed on ${p.url()}`)
await p.goto(BASE + '/', { waitUntil: 'networkidle' })

for (const [sel, want] of [
  ['.fcb__btn--instagram', 'Visit SUBAM PROMOTERS on Instagram'],
  ['.fcb__btn--whatsapp', 'Message SUBAM PROMOTERS on WhatsApp'],
  ['.fcb__btn--phone', 'Call SUBAM PROMOTERS'],
]) {
  const al = await p.locator(sel).getAttribute('aria-label')
  al === want ? ok(`aria-label "${al}"`) : bad(`aria-label ${sel}`, String(al))
}

const t = await p.locator('.fcb__btn--instagram').getAttribute('target')
const rel = await p.locator('.fcb__btn--instagram').getAttribute('rel')
t === '_blank' && rel === 'noopener noreferrer'
  ? ok('Instagram _blank + noopener noreferrer')
  : bad('ig target/rel', `${t}/${rel}`)

const telTarget = await p.locator('.fcb__btn--phone').getAttribute('target')
telTarget === null ? ok('tel: link does not open a new tab') : bad('tel target', 'has target')

let reached = 0
for (let i = 0; i < 120; i++) {
  await p.keyboard.press('Tab')
  const cls = await p.evaluate(() => document.activeElement?.className ?? '')
  if (String(cls).includes('fcb__btn')) reached++
  if (reached === 3) break
}
reached === 3 ? ok('all three reachable by Tab') : bad('keyboard', `only ${reached}/3 reachable`)

await p.locator('.fcb__btn--whatsapp').focus()
const ring = await p.evaluate(
  () => getComputedStyle(document.querySelector('.fcb__btn--whatsapp')).outlineColor,
)
const GOLD = /212,\s*175,\s*106/
GOLD.test(ring) ? ok('gold focus outline') : bad('focus ring', ring)

const svgCount = await p.locator('.fcb__btn svg').count()
svgCount === 3 ? ok('three react-icons SVGs') : bad('icons', `${svgCount} svg`)

const beforeScroll = await p.locator('.fcb__list--left').boundingBox()
await p.evaluate(() => window.scrollTo(0, 2000))
await p.waitForTimeout(900)
const afterScroll = await p.locator('.fcb__list--left').boundingBox()
Math.abs(beforeScroll.y - afterScroll.y) < 2
  ? ok('stays fixed while scrolling')
  : bad('fixed', 'moved on scroll')
await p.screenshot({ path: 'scripts/shots/fcb-desktop.png' })
await ctx.close()

/* ---------- Contact details replaced site-wide ---------- */
const ctxC = await b.newContext({ viewport: { width: 1440, height: 900 } })
const pc = await ctxC.newPage()
const OLD_PHONE = /00000/
const OLD_TEL = /tel:\+?910000000000/
const OLD_EMAIL = /hello@subampromoters\.com/
for (const route of ['/', '/contact/', '/privacy-policy/', '/terms-and-conditions/']) {
  await pc.goto(BASE + route, { waitUntil: 'networkidle' })
  const text = await pc.evaluate(() => document.body.innerText)
  const html = await pc.content()
  const hasOldPhone = OLD_PHONE.test(text) || OLD_TEL.test(html)
  hasOldPhone
    ? bad(`placeholders on ${route}`, 'old phone placeholder still present')
    : ok(`no phone placeholder on ${route}`)
  const hasOldEmail = OLD_EMAIL.test(text + html)
  hasOldEmail
    ? bad(`placeholders on ${route}`, 'old email still present')
    : ok(`no email placeholder on ${route}`)
}

await pc.goto(BASE + '/contact/', { waitUntil: 'networkidle' })
const contactText = await pc.evaluate(() => document.body.innerText)
contactText.includes(EMAIL) ? ok(`contact page shows ${EMAIL}`) : bad('contact email', 'not shown')
contactText.includes(PHONE_DISPLAY) ? ok(`contact page shows ${PHONE_DISPLAY}`) : bad('contact phone', 'not shown')
const mailto = await pc.locator(`a[href="mailto:${EMAIL}"]`).count()
mailto > 0 ? ok('mailto link uses the new address') : bad('mailto', 'not found')
const telLink = await pc.locator(`a[href="tel:+${NUMBER}"]`).count()
telLink > 0 ? ok('contact page tel: link uses the new number') : bad('contact tel', 'not found')
const waLink = await pc.locator('.contact__list a[href^="https://wa.me/917603976398"]').count()
waLink > 0 ? ok('contact page WhatsApp link redirects correctly') : bad('contact whatsapp', 'not found')

await pc.goto(BASE + '/', { waitUntil: 'networkidle' })
const ctaTel = await pc.locator(`.final-cta__direct a[href="tel:+${NUMBER}"]`).count()
const ctaMail = await pc.locator(`.final-cta__direct a[href="mailto:${EMAIL}"]`).count()
ctaTel > 0 && ctaMail > 0
  ? ok('home final CTA phone + email links redirect correctly')
  : bad('home CTA links', `tel=${ctaTel} mail=${ctaMail}`)

const footTel = await pc.locator(`.site-footer a[href="tel:+${NUMBER}"]`).count()
const footMail = await pc.locator(`.site-footer a[href="mailto:${EMAIL}"]`).count()
const footWa = await pc.locator('.site-footer a[href^="https://wa.me/917603976398"]').count()
footTel && footMail && footWa
  ? ok('footer phone, email and WhatsApp all redirect correctly')
  : bad('footer links', `tel=${footTel} mail=${footMail} wa=${footWa}`)
await ctxC.close()

/* ---------- Responsive geometry + footer clearance ---------- */
for (const [label, opts, min, max] of [
  ['desktop 1440', { viewport: { width: 1440, height: 900 } }, 46, 48],
  ['laptop 1024', { viewport: { width: 1024, height: 768 } }, 46, 48],
  ['tablet', { ...devices['iPad (gen 7)'] }, 40, 48],
  ['iPhone 13', { ...devices['iPhone 13'] }, 40, 46],
  ['small 320', { viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true }, 40, 46],
]) {
  const c = await b.newContext(opts)
  const pg = await c.newPage()
  await pg.goto(BASE + '/', { waitUntil: 'networkidle' })
  await pg.waitForTimeout(350)

  const boxes = await pg.$$eval('.fcb__btn', els =>
    els.map(e => {
      const r = e.getBoundingClientRect()
      return { x: r.x, y: r.y, w: r.width, h: r.height }
    }),
  )
  const w = await pg.evaluate(() => window.innerWidth)
  const h = await pg.evaluate(() => window.innerHeight)

  const d = Math.round(boxes[0].w)
  d >= min && d <= max ? ok(`${label}: diameter ${d}px`) : bad(label, `diameter ${d}px outside ${min}-${max}`)
  boxes.every(x => Math.round(x.w) === Math.round(x.h)) ? ok(`${label}: circular`) : bad(label, 'not circular')
  boxes.some(x => x.x < 0 || x.x + x.w > w || x.y < 0 || x.y + x.h > h)
    ? bad(label, 'a button is clipped')
    : ok(`${label}: none clipped`)

  const lb = await pg.locator('.fcb__list--left').boundingBox()
  const rb = await pg.locator('.fcb__list--right').boundingBox()
  overlaps(lb, rb) ? bad(label, 'left and right stacks overlap') : ok(`${label}: stacks clear of each other`)

  const ovf = await pg.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  ovf <= 1 ? ok(`${label}: no horizontal overflow`) : bad(label, `horizontal overflow ${ovf}px`)

  await pg.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await pg.waitForTimeout(900)
  const legal = await pg.locator('.site-footer__legal').boundingBox()
  const copy = await pg.locator('.site-footer__bottom p').boundingBox()
  const l2 = await pg.locator('.fcb__list--left').boundingBox()
  const r2 = await pg.locator('.fcb__list--right').boundingBox()
  overlaps(l2, legal) || overlaps(l2, copy) || overlaps(r2, legal) || overlaps(r2, copy)
    ? bad(label, 'buttons cover the footer copyright/legal links')
    : ok(`${label}: clears footer links at page bottom`)

  await pg.screenshot({ path: `scripts/shots/fcb-${label.replace(/\W/g, '')}.png` })
  await c.close()
}

/* ---------- Mobile menu must cover them ---------- */
const c3 = await b.newContext({ ...devices['iPhone 13'] })
const p3 = await c3.newPage()
await p3.goto(BASE + '/', { waitUntil: 'networkidle' })
await p3.locator('.menu-toggle').click()
await p3.waitForTimeout(450)
const covered = await p3.evaluate(() => {
  const el = document.querySelector('.fcb__btn--whatsapp')
  const r = el.getBoundingClientRect()
  const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
  return top !== el && !el.contains(top)
})
covered ? ok('open mobile menu covers the buttons') : bad('mobile menu', 'buttons float above the menu')
await c3.close()

await b.close()
for (const [s, n] of results) console.log(`${s.padEnd(4)} ${n}`)
console.log(`\nconsole/page errors: ${errors.length}`)
errors.slice(0, 5).forEach(e => console.log('  !', e))
const fails = results.filter(r => r[0] === 'BAD').length
console.log(`${results.length - fails}/${results.length} passed`)
process.exit(fails || errors.length ? 1 : 0)
