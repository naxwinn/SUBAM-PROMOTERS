import { useEffect } from 'react'

import { company } from './site'

const SITE_ORIGIN = 'https://www.subampromoters.com'

type Seo = {
  title: string
  description: string
  path: string
  /** Absolute or build-hashed URL for the social preview image. */
  image?: string
  type?: 'website' | 'article'
}

const upsertMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Sets title, description, canonical and social tags per route.
 *
 * This is a client-rendered app, so these tags are written after hydration.
 * Crawlers that execute JavaScript read them correctly; if this site later
 * needs guaranteed crawlability for every route, pre-rendering is the step to
 * add, and this hook keeps working unchanged.
 */
export function useSeo({ title, description, path, image, type = 'website' }: Seo) {
  useEffect(() => {
    const fullTitle =
      path === '/' ? `${company.name} — ${company.tagline}` : `${title} | ${company.name}`
    const url = `${SITE_ORIGIN}${path}`

    document.title = fullTitle
    upsertMeta('meta[name="description"]', 'name', 'description', description)
    upsertLink('canonical', url)

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url)
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type)
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', company.name)
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)

    if (image) {
      const absolute = image.startsWith('http') ? image : `${SITE_ORIGIN}${image}`
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', absolute)
      upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', absolute)
    }
  }, [title, description, path, image, type])
}

/** JSON-LD for the organisation. Only facts that are actually known are emitted. */
export function useOrganisationSchema() {
  useEffect(() => {
    const id = 'ld-organisation'
    document.getElementById(id)?.remove()

    const script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: company.name,
      slogan: company.tagline,
      url: SITE_ORIGIN,
      email: company.email,
      address: { '@type': 'PostalAddress', addressRegion: company.location, addressCountry: 'IN' },
    })
    document.head.appendChild(script)

    return () => script.remove()
  }, [])
}
