# SUBAM PROMOTERS — corporate website

Powering Businesses. Elevating Ventures.

A multi-page React site for a real estate marketing and digital growth company,
built around two equally weighted divisions: **Real Estate Marketing & Promotion**
and **Digital Marketing & Business Promotion**.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the built site on http://localhost:4173
npm run verify     # 73 end-to-end browser checks against the preview server
npm run lint
```

`npm run verify` needs the preview server running first. It runs 73 checks.

## Before launch

These are the only things standing between this build and a live site.

| Item | Where | Why |
| --- | --- | --- |
| Real phone number and email | `src/lib/site.ts` → `company` | Currently placeholders (`+91 00000 00000`) |
| Postal address | `src/lib/site.ts` → `company.address` | Empty; fills the organisation schema |
| Enquiry endpoint | `.env` → `VITE_ENQUIRY_ENDPOINT` | Without it the form reports a send failure instead of pretending to send |
| Production domain | `src/lib/seo.ts` → `SITE_ORIGIN`, `public/robots.txt`, `scripts/sitemap.mjs` | Canonical URLs and sitemap |
| Legal review | `src/pages/Legal.tsx` | Policies describe real behaviour but are not legal advice |

## Architecture

```
src/
  assets/            Optimised WebP + JPEG, generated from media/
  components/
    FlipCard.jsx     ┐
    PeekRating.jsx   ├ React Bits, installed via the shadcn registry, unmodified
    SplitFlapText.jsx┘
    react-bits.d.ts  Type declarations for the three above
    layout/          Header, Footer, PageHero, Breadcrumbs, Layout
    motion/          SmoothScroll (Lenis), Parallax, Reveal (GSAP ScrollTrigger)
    sections/        Homepage sections
    ui/              Button, Section, Picture
  lib/
    assets.ts        Asset map — every image identified by its actual content
    site.ts          All copy, services, work, insights, contact details
    seo.ts           Per-route title/description/canonical/OG + JSON-LD
    motion.ts        Reduced-motion and pointer-type helpers
  pages/             One file per route
  styles/            tokens.css (brand palette) + base.css
```

**Content is centralised.** Services, work items, insights and contact details all
live in `src/lib/site.ts`. Adding an insight or a project means adding an object
to an array — the listing page, detail route, sitemap and related-work sections
all pick it up.

## Brand palette

Defined once in `src/styles/tokens.css` and used everywhere via CSS variables.
No colour outside this list appears in the interface.

| Token | Hex | Use |
| --- | --- | --- |
| `--color-deep-teal` | `#063B3D` | Navigation, primary brand surfaces |
| `--color-signature-teal` | `#087E83` | Interactive elements, highlights |
| `--color-gold` | `#D4AF6A` | Selective accents, hairlines, one CTA per view |
| `--color-ivory` | `#F9F2E2` | Content backgrounds, text on dark |
| `--color-midnight-teal` | `#012224` | Hero, footer, dramatic transitions |
| `--color-white` | `#FFFFFF` | Cards, forms, clean space |

## Typography

Three tokens, two roles:

| Token | Face | Applies to |
| --- | --- | --- |
| `--font-heading` | Schibsted Grotesk | Headings, buttons, nav, labels |
| `--font-body` | Schibsted Grotesk | Default for all interface chrome |
| `--font-prose` | Source Serif 4 | `p` and `blockquote` only — running text |

The serif is opt-in rather than the page default. Interface chrome — nav,
buttons, form fields, metadata, badges — stays on the sans, because an interface
set entirely in a text serif reads like a book rather than a product. A handful
of `<p>` elements that are chrome rather than prose (card categories, field
errors, result counts) are listed explicitly in `base.css`.

Paragraphs set their own `line-height: 1.7`, slightly more than the sans would
need at the same size.

Verify the split stayed correct after any CSS change with
`node scripts/audit-fonts.mjs`, which reports the computed family for 32
elements across four pages.

## Motion

Lenis drives smooth scrolling from GSAP's ticker, so both share one RAF loop.
ScrollTrigger handles parallax and reveals.

- **Reduced motion is honoured everywhere.** Lenis does not initialise, parallax
  and reveals do not run, and the division cards render a static, non-flipping
  equivalent with the same content.
- **Touch scrolling is never hijacked.** Lenis `syncTouch` stays off.
- **Only decorative layers move.** No text or control is ever parallaxed.
- **Cleanup is complete.** `useGSAP` scopes every tween, and the Lenis instance,
  ticker callback and ScrollTriggers are torn down on unmount, so StrictMode's
  double-invoke cannot leave a second loop behind.
- **No infinite scroll.** The page scrolls normally to the footer.

## Honesty constraints

The brief forbade inventing credentials, and the build holds that line:

- Every work item is labelled **Conceptual Project** or **Illustrative Creative**.
  No client is named and no campaign result is claimed.
- Work detail pages carry an explicit "Results: not published" field rather than
  omitting the question.
- `testimonials` in `src/lib/site.ts` is an empty array. The section renders
  nothing until real, consented feedback is added, at which point it publishes
  itself. No fabricated quotes, names, photographs or star ratings exist anywhere.
- `PeekRating` is used as a genuine *input* on the enquiry form — it captures the
  visitor's own rating. It never displays an aggregate score.
- No award, certification, years-of-experience or project-count claim appears.

## Assets

The seven supplied images were inspected individually and mapped by content:

| File | Content | Used for |
| --- | --- | --- |
| `logo` | Circular gold mark, SUBAM PROMOTERS | Header, footer, favicons |
| `villa-street-golden-hour` | Villa street at golden hour | Homepage hero |
| `villa-dusk-entrance` | Luxury villa entrance at dusk | Real estate division |
| `aerial-boulevard` | Tree-lined boulevard, aerial | Final CTA, insights |
| `aerial-plotted-layout` | Plotted residential layout, aerial | Real estate secondary |
| `content-studio` | Product filming setup | Digital marketing division |
| `campaign-review` | Campaign dashboard review | Digital marketing secondary |

The logo is a JPEG with a dark-teal field baked in. It is never recoloured,
stretched or redrawn — a circular mask isolates the mark and `object-fit: contain`
preserves its proportions.

Regenerate optimised assets after changing `media/` with `npm run images`
(5.3 MB → 2.6 MB on the current set).

## Deployment

The build is a static SPA. Deep links need a rewrite to `index.html`:

- **Netlify** — `public/_redirects` is included.
- **Vercel** — `vercel.json` is included.
- **Other hosts** — rewrite all paths to `/index.html`.

Routes use trailing slashes; the non-slash form of each redirects to it.

### A note on SEO

Meta tags are set per route on the client. Crawlers that execute JavaScript read
them correctly. If guaranteed crawlability for every route matters, add
pre-rendering — `src/lib/seo.ts` keeps working unchanged.
