import type { ImageKey } from './assets'

/**
 * Single source of truth for contact details — edit here, updates everywhere.
 *
 * Consumed by the footer, contact page, enquiry form, final CTA, legal pages
 * and the organisation JSON-LD, so these values must stay consistent with the
 * floating contact buttons in `components/FloatingContactButtons.jsx`.
 */
export const company = {
  name: 'SUBAM PROMOTERS',
  tagline: 'Powering Businesses. Elevating Ventures.',
  email: 'subampromoters.ventures@gmail.com',
  phone: '+91 7603 976 398',
  phoneHref: 'tel:+917603976398',
  whatsappHref:
    'https://wa.me/917603976398?text=' +
    encodeURIComponent("Hi SUBAM PROMOTERS, I'm interested in your services."),
  location: 'Tamil Nadu, India',
  /* Set to a verified postal address before launch. */
  address: '',
}

export type NavItem = { label: string; to: string }

export const primaryNav: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about/' },
  { label: 'Real Estate', to: '/real-estate-promotion/' },
  { label: 'Digital Marketing', to: '/digital-marketing/' },
  { label: 'Our Work', to: '/our-work/' },
  { label: 'Insights', to: '/insights/' },
  { label: 'Contact', to: '/contact/' },
]

export const legalNav: NavItem[] = [
  { label: 'Privacy Policy', to: '/privacy-policy/' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions/' },
]

export type Service = { title: string; description: string }

export type Division = {
  id: 'real-estate' | 'digital'
  name: string
  shortName: string
  to: string
  image: ImageKey
  secondaryImage: ImageKey
  cardDescription: string
  backIntro: string
  benefit: string
  cta: string
  intro: string
  services: Service[]
}

export const divisions: Division[] = [
  {
    id: 'real-estate',
    name: 'Real Estate Marketing & Promotion',
    shortName: 'Real Estate',
    to: '/real-estate-promotion/',
    image: 'villaDusk',
    secondaryImage: 'aerialPlotted',
    cardDescription:
      'Showcase your property projects with compelling visual content, targeted promotion and enquiry-focused marketing.',
    backIntro:
      'We promote residential and commercial projects to the people most likely to buy them.',
    benefit:
      'Clear positioning and honest project storytelling make it easier for the right buyers to recognise what you have built.',
    cta: 'Explore Real Estate Services',
    intro:
      'A property project competes for attention long before anyone visits the site. We help developers and land owners present a project clearly — what it is, who it suits and why it is worth a visit.',
    services: [
      {
        title: 'Property and Project Promotion',
        description:
          'Communicate the value of residential and commercial projects to the audiences most likely to respond.',
      },
      {
        title: 'Property Video Creatives',
        description:
          'Present projects through polished visual storytelling, from walkthroughs to short social edits.',
      },
      {
        title: 'Promotional Content',
        description:
          'Create brochures, listings and campaign material tailored to the property and its target audience.',
      },
      {
        title: 'Campaign Planning',
        description:
          'Structure promotion around project objectives, launch phases and relevant local audiences.',
      },
      {
        title: 'Lead Generation Campaigns',
        description:
          'Develop campaigns designed to attract relevant enquiries and route them to your sales team.',
      },
      {
        title: 'Project Landing Pages',
        description:
          'Build project-specific pages that explain the development and make enquiring straightforward.',
      },
    ],
  },
  {
    id: 'digital',
    name: 'Digital Marketing & Business Promotion',
    shortName: 'Digital Marketing',
    to: '/digital-marketing/',
    image: 'contentStudio',
    secondaryImage: 'campaignReview',
    cardDescription:
      'Strengthen your brand presence through digital campaigns, social content, promotional videos and conversion-focused experiences.',
    backIntro:
      'We plan, produce and run the campaigns that keep a business visible to the people it serves.',
    benefit:
      'Consistent creative and well-structured campaigns give a business a presence its customers can recognise and trust.',
    cta: 'Explore Digital Marketing',
    intro:
      'Visibility is only useful when it reaches the right people and leads somewhere. We combine paid campaigns, organic content and conversion-focused pages into one coherent plan.',
    services: [
      {
        title: 'Google Ads',
        description:
          'Build and manage search, display and other suitable advertising campaigns against defined objectives.',
      },
      {
        title: 'Meta Ads',
        description:
          'Plan and manage Facebook and Instagram campaigns, from audience structure to creative testing.',
      },
      {
        title: 'Social Media Management',
        description:
          'Develop content plans, publishing schedules and brand-consistent communication across channels.',
      },
      {
        title: 'Promotional Videos and Reels',
        description:
          'Produce short-form creative assets suited to the pace and format of each digital channel.',
      },
      {
        title: 'Creative Production and Copywriting',
        description:
          'Develop the visual and written assets a campaign needs, written for the audience it targets.',
      },
      {
        title: 'Landing Pages and Conversion Optimisation',
        description:
          'Improve the journey from campaign interaction to business enquiry, then refine it with real data.',
      },
    ],
  },
]

export const principles = [
  {
    title: 'Strategic Planning',
    body: 'Understand the project, audience, positioning and business objectives before recommending promotional activities.',
  },
  {
    title: 'Creative Execution',
    body: 'Develop visual and written communication aligned with the brand, the campaign and the intended audience.',
  },
  {
    title: 'Transparent Communication',
    body: 'Maintain clear expectations, realistic timelines and understandable updates throughout the engagement.',
  },
  {
    title: 'Measurable Objectives',
    body: 'Define relevant campaign objectives and review available performance data to guide improvements.',
  },
]

export const processSteps = [
  {
    title: 'Discover',
    body: 'Understand the business, project, audience, objectives and existing promotional efforts.',
  },
  {
    title: 'Strategise',
    body: 'Develop a suitable marketing approach, service scope, creative direction and campaign plan.',
  },
  {
    title: 'Execute',
    body: 'Create and deploy the agreed promotional assets, campaigns and digital experiences.',
  },
  {
    title: 'Optimise',
    body: 'Review relevant performance data, identify improvements and refine the approach where appropriate.',
  },
]

export const workCategories = [
  'Real Estate Projects',
  'Digital Campaigns',
  'Video Production',
  'Creative Work',
] as const

export type WorkCategory = (typeof workCategories)[number]

export type WorkItem = {
  slug: string
  title: string
  category: WorkCategory
  image: ImageKey
  /**
   * Every item below is conceptual. No client is named and no performance
   * result is claimed. `status` drives the on-card label so this can never be
   * mistaken for delivered client work.
   */
  status: 'Conceptual Project' | 'Illustrative Creative'
  brief: string
  objective: string
  delivered: string[]
}

export const workItems: WorkItem[] = [
  {
    slug: 'hillside-villa-launch',
    title: 'Hillside Villa Launch',
    category: 'Real Estate Projects',
    image: 'villaStreet',
    status: 'Conceptual Project',
    brief:
      'A demonstration of how a premium villa development could be introduced to buyers across a phased launch.',
    objective:
      'Show how positioning, photography and a focused enquiry path work together at launch.',
    delivered: [
      'Launch campaign structure',
      'Project landing page',
      'Photography direction',
      'Enquiry routing',
    ],
  },
  {
    slug: 'plotted-development-campaign',
    title: 'Plotted Development Campaign',
    category: 'Real Estate Projects',
    image: 'aerialPlotted',
    status: 'Conceptual Project',
    brief:
      'An illustrative approach to promoting an approved plotted layout to buyers and investors in the surrounding region.',
    objective:
      'Demonstrate how aerial context and plot-level clarity reduce the questions a buyer asks before visiting.',
    delivered: ['Aerial and site visuals', 'Audience and radius planning', 'Campaign creative set'],
  },
  {
    slug: 'studio-content-system',
    title: 'Studio Content System',
    category: 'Video Production',
    image: 'contentStudio',
    status: 'Illustrative Creative',
    brief:
      'A repeatable content format for a business that needs a steady stream of product and service videos.',
    objective: 'Illustrate how one studio session can supply a month of channel-ready creative.',
    delivered: ['Shot list and format', 'Short-form edits', 'Caption and copy system'],
  },
  {
    slug: 'campaign-performance-review',
    title: 'Campaign Performance Review',
    category: 'Digital Campaigns',
    image: 'campaignReview',
    status: 'Illustrative Creative',
    brief:
      'An example of the review rhythm used to read campaign data and decide what to change next.',
    objective:
      'Show how reporting turns into specific creative and targeting decisions rather than a monthly PDF.',
    delivered: ['Reporting structure', 'Creative iteration plan', 'Conversion review'],
  },
  {
    slug: 'boulevard-brand-film',
    title: 'Boulevard Brand Film',
    category: 'Creative Work',
    image: 'aerialBoulevard',
    status: 'Conceptual Project',
    brief:
      'A conceptual brand film treatment that introduces a large development through its approach road and public realm.',
    objective: 'Demonstrate an establishing narrative that sells the setting before the specification.',
    delivered: ['Film treatment', 'Storyboard direction', 'Music and pacing notes'],
  },
  {
    slug: 'villa-identity-study',
    title: 'Villa Identity Study',
    category: 'Creative Work',
    image: 'villaDusk',
    status: 'Illustrative Creative',
    brief:
      'An identity and collateral study showing how a single project can hold a consistent look across every touchpoint.',
    objective: 'Illustrate consistency between signage, brochure, social creative and the project page.',
    delivered: ['Collateral direction', 'Typography and colour study', 'Template set'],
  },
]

export type Insight = {
  slug: string
  title: string
  summary: string
  readingTime: string
  category: 'Real Estate' | 'Digital Marketing' | 'Practice'
  image: ImageKey
  body: string[]
}

export const insights: Insight[] = [
  {
    slug: 'what-buyers-look-for-before-a-site-visit',
    title: 'What buyers look for before a site visit',
    summary:
      'Most of the decision to visit a property happens online. Here is what a project page has to answer first.',
    readingTime: '4 min read',
    category: 'Real Estate',
    image: 'aerialBoulevard',
    body: [
      'A site visit costs a buyer half a day. Before committing to that, they want to resolve a short list of questions, and most project pages answer them in the wrong order.',
      'Location comes first, and not as a pin on a map. Buyers want to know what is within a ten minute drive: schools, hospitals, the main road out, the places they already go. A map without that context creates more questions than it answers.',
      'Approvals and status come second. Whether a layout is approved, what phase is selling and when handover is expected are not details to withhold until a phone call. Publishing them filters out enquiries you were never going to convert and raises the quality of the ones you get.',
      'Price range comes third. Hiding it does not increase enquiries; it increases unqualified ones. A stated range, even a broad one, lets the right buyer self-select.',
      'Everything else — elevation renders, amenity lists, specification tables — supports a decision that has already been made. Put the deciding information first and let the rest confirm it.',
    ],
  },
  {
    slug: 'reading-campaign-data-without-fooling-yourself',
    title: 'Reading campaign data without fooling yourself',
    summary:
      'Impressions and reach are easy to report and easy to misread. A short guide to the numbers that change decisions.',
    readingTime: '5 min read',
    category: 'Digital Marketing',
    image: 'campaignReview',
    body: [
      'Every ad platform offers a generous set of metrics, and the most prominent ones are rarely the most useful. Reach and impressions describe how much a budget was spent, not what it achieved.',
      'The first number worth tracking is cost per qualified enquiry, not cost per lead. A form fill from someone outside your service area is not a lead, and counting it makes a campaign look cheaper than it is.',
      'The second is the ratio between enquiries and conversations. If a campaign produces many submissions but few answered calls, the problem is usually targeting or expectation-setting in the creative, not the sales follow-up.',
      'The third is time. Most campaigns are judged too early, on a sample too small to mean anything. Agree in advance how long a test runs and how many conversions it needs before anyone draws a conclusion.',
      'Where data is thin, say so. A campaign that has produced eleven enquiries cannot support a confident claim about anything, and presenting it as though it can damages the next decision.',
    ],
  },
  {
    slug: 'a-practical-brief-for-property-video',
    title: 'A practical brief for property video',
    summary:
      'What to decide before a camera arrives on site, so the edit matches what the project actually needs.',
    readingTime: '4 min read',
    category: 'Practice',
    image: 'contentStudio',
    body: [
      'Property video goes wrong at the brief, not the edit. The most common failure is shooting a single long film when the campaign needs six short ones.',
      'Decide the destination first. A film for a sales lounge can run three minutes. A film for a social feed has roughly three seconds to establish where it is and what it is showing.',
      'Decide the season and the hour. Light does more for a project than any colour grade, and golden hour on an east-facing elevation is a different film from midday on the same elevation.',
      'Decide what cannot be shown. Unfinished landscaping, neighbouring construction and incomplete phases are facts; planning around them honestly is better than a grade that hides them and a buyer who notices on arrival.',
      'Finally, agree the cutdowns before the shoot. Knowing you need a sixty second, a thirty and three verticals changes the shot list on the day and saves a reshoot.',
    ],
  },
]

export type Testimonial = {
  quote: string
  name: string
  role: string
  /** Only set this once the person has agreed in writing to be quoted. */
  consentOnFile: true
}

/**
 * Deliberately empty.
 *
 * No testimonial, name, company, photograph, rating or review count has been
 * supplied, and inventing any of them would misrepresent the business. The
 * section that renders this is built and wired, but shows nothing until real,
 * consented feedback is added here — at which point it publishes itself.
 */
export const testimonials: Testimonial[] = []
