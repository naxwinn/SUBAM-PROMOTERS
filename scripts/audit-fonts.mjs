import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })

const check = async (url, pairs) => {
  await p.goto('http://localhost:4173' + url, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  console.log(`\n--- ${url} ---`)
  for (const [sel, want] of pairs) {
    const fam = await p.evaluate(s => {
      const el = document.querySelector(s)
      if (!el) return 'MISSING'
      return getComputedStyle(el).fontFamily.split(',')[0].replace(/"/g, '')
    }, sel)
    const got = fam.includes('Source Serif') ? 'serif' : fam.includes('Schibsted') ? 'sans' : fam
    const ok = got === want
    console.log(`${ok ? 'ok  ' : 'BAD '} ${sel.padEnd(34)} want=${want.padEnd(5)} got=${got}`)
  }
}

await check('/', [
  ['h1', 'sans'],
  ['.hero__lede', 'serif'],
  ['.site-nav__link', 'sans'],
  ['.btn', 'sans'],
  ['.section-head__lede', 'serif'],
  ['.services__item-body', 'serif'],
  ['.services__item-title', 'sans'],
  ['.division-card__desc', 'serif'],
  ['.division-card__cue', 'sans'],
  ['.process__body', 'serif'],
  ['.process__marker', 'sans'],
  ['.site-footer__col a', 'sans'],
  ['.site-footer__blurb', 'serif'],
])

await check('/contact/', [
  ['.field label', 'sans'],
  ['.field input', 'sans'],
  ['.field textarea', 'sans'],
  ['.field select', 'sans'],
  ['.contact__list span', 'sans'],
  ['.contact__divisions span', 'sans'],
  ['.contact__hint', 'serif'],
  ['.breadcrumbs a', 'sans'],
  ['.enquiry__note', 'serif'],
])

await check('/insights/what-buyers-look-for-before-a-site-visit/', [
  ['.article p', 'serif'],
  ['.article__lede', 'serif'],
  ['.article__meta', 'sans'],
  ['.article__more a', 'sans'],
])

await check('/insights/', [
  ['.insights__title', 'sans'],
  ['.insights__summary', 'serif'],
  ['.insights__category', 'sans'],
  ['.insights__time', 'sans'],
  ['.insights__hint', 'sans'],
  ['.insights__read', 'sans'],
  ['.insights__cta-title', 'sans'],
  ['.insights__cta-body', 'serif'],
  ['.ag-panel__text', 'sans'],
])

await b.close()
