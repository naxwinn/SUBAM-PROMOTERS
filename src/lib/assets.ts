/**
 * Supplied SUBAM PROMOTERS assets.
 * Each entry was mapped by inspecting the actual image content.
 * Imported (not referenced by path) so Vite fingerprints and copies them
 * into the build output — local paths are never relied on at runtime.
 */
import aerialBoulevardJpg from '@/assets/aerial-boulevard.jpg'
import aerialBoulevardWebp from '@/assets/aerial-boulevard.webp'
import aerialPlottedJpg from '@/assets/aerial-plotted-layout.jpg'
import aerialPlottedWebp from '@/assets/aerial-plotted-layout.webp'
import campaignReviewJpg from '@/assets/campaign-review.jpg'
import campaignReviewWebp from '@/assets/campaign-review.webp'
import contentStudioJpg from '@/assets/content-studio.jpg'
import contentStudioWebp from '@/assets/content-studio.webp'
import logoJpg from '@/assets/logo.jpg'
import logoWebp from '@/assets/logo.webp'
import villaDuskJpg from '@/assets/villa-dusk-entrance.jpg'
import villaDuskWebp from '@/assets/villa-dusk-entrance.webp'
import villaStreetJpg from '@/assets/villa-street-golden-hour.jpg'
import villaStreetWebp from '@/assets/villa-street-golden-hour.webp'

export type ImageAsset = {
  webp: string
  jpg: string
  alt: string
  width: number
  height: number
}

export const logo = {
  webp: logoWebp,
  jpg: logoJpg,
  alt: 'SUBAM PROMOTERS',
  width: 512,
  height: 512,
}

export const images = {
  villaStreet: {
    webp: villaStreetWebp,
    jpg: villaStreetJpg,
    alt: 'A hillside street of contemporary villas lit at golden hour, with a city skyline in the distance.',
    width: 1672,
    height: 941,
  },
  villaDusk: {
    webp: villaDuskWebp,
    jpg: villaDuskJpg,
    alt: 'The glazed entrance of a luxury villa glowing warmly at dusk, framed by palms.',
    width: 1536,
    height: 1024,
  },
  aerialBoulevard: {
    webp: aerialBoulevardWebp,
    jpg: aerialBoulevardJpg,
    alt: 'Aerial view of a tree-lined boulevard running through a plotted villa development at sunrise.',
    width: 1920,
    height: 1080,
  },
  aerialPlotted: {
    webp: aerialPlottedWebp,
    jpg: aerialPlottedJpg,
    alt: 'Aerial view of a plotted residential layout with surfaced roads, marked plots and completed homes.',
    width: 980,
    height: 653,
  },
  contentStudio: {
    webp: contentStudioWebp,
    jpg: contentStudioJpg,
    alt: 'A content producer filming a product flat-lay on a bright studio table with a camera and ring light.',
    width: 1376,
    height: 768,
  },
  campaignReview: {
    webp: campaignReviewWebp,
    jpg: campaignReviewJpg,
    alt: 'Two marketers reviewing a campaign dashboard on a large monitor in a modern office.',
    width: 1672,
    height: 941,
  },
} satisfies Record<string, ImageAsset>

export type ImageKey = keyof typeof images
