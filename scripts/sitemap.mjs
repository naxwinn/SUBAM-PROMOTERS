import { writeFile } from 'node:fs/promises'

const ORIGIN = process.env.SITE_ORIGIN ?? 'https://www.subampromoters.com'

const WORK = [
  'hillside-villa-launch', 'plotted-development-campaign', 'studio-content-system',
  'campaign-performance-review', 'boulevard-brand-film', 'villa-identity-study',
]
const INSIGHTS = [
  'what-buyers-look-for-before-a-site-visit',
  'reading-campaign-data-without-fooling-yourself',
  'a-practical-brief-for-property-video',
]

const routes = [
  ['/', '1.0'],
  ['/about/', '0.8'],
  ['/real-estate-promotion/', '0.9'],
  ['/digital-marketing/', '0.9'],
  ['/our-work/', '0.8'],
  ['/insights/', '0.7'],
  ['/contact/', '0.9'],
  ['/privacy-policy/', '0.3'],
  ['/terms-and-conditions/', '0.3'],
  ...WORK.map(slug => [`/our-work/${slug}/`, '0.6']),
  ...INSIGHTS.map(slug => [`/insights/${slug}/`, '0.6']),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(([path, priority]) => `  <url>\n    <loc>${ORIGIN}${path}</loc>\n    <priority>${priority}</priority>\n  </url>`).join('\n')}
</urlset>
`

await writeFile('public/sitemap.xml', xml)
console.log(`sitemap.xml written with ${routes.length} URLs`)
