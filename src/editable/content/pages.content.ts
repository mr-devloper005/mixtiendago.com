import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: `${slot4BrandConfig.siteName} — Local directory and reference library`,
      description: 'A calmer home for local discovery and useful references — browse trusted places and downloadable guides in one connected space.',
      openGraphTitle: `${slot4BrandConfig.siteName} — Local directory and reference library`,
      openGraphDescription: 'Trusted places nearby, curated reference material worth keeping. One calm home for everyday discovery.',
      keywords: ['local directory', 'reference library', 'guides', 'places nearby', 'community picks'],
    },
    hero: {
      badge: 'A calmer home for discovery',
      title: ['Discover every corner.'],
      description: `At ${slot4BrandConfig.siteName}, we pair a local directory of trusted places with a curated reference library — so every visit turns into a real find, and every read leaves you with something to keep.`,
      primaryCta: { label: 'Start exploring', href: '/' },
      secondaryCta: { label: 'Browse references', href: '/pdf' },
      searchPlaceholder: 'Search places, references, categories…',
      focusLabel: 'Focus',
      featureCardBadge: 'latest entries',
      featureCardTitle: 'Fresh finds keep the home page in motion.',
      featureCardDescription: 'The newest places and references shape what visitors see first — no manual curation required.',
    },
    intro: {
      badge: 'About the platform',
      title: 'Two surfaces, one connected home.',
      paragraphs: [
        `${slot4BrandConfig.siteName} keeps a local directory and a reference library side by side — so you can jump from a place worth visiting to a guide worth keeping without losing your thread.`,
        'Every entry is filed with clear categories, quick-facts and calm metadata, so browsing feels closer to reading than to hunting.',
        'The section rhythm stays the same across the site — you can trust where things live and how they behave.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'A local directory of trusted places, tagged and checked.',
        'A reference library of downloadable guides and reports.',
        'One quiet rhythm across every browsing surface.',
        'Fast, calm navigation — no dark patterns, no filler.',
      ],
      primaryLink: { label: 'Open the directory', href: '/listings' },
      secondaryLink: { label: 'Browse references', href: '/pdf' },
    },
    cta: {
      badge: 'Start exploring',
      title: 'One home for places worth visiting and material worth keeping.',
      description: 'Move between the directory and the reference library in one calm, connected rhythm.',
      primaryCta: { label: 'Open the directory', href: '/listings' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest entries in this section.',
    },
  },
  about: {
    badge: 'Our story',
    title: 'A calmer, clearer way to explore.',
    description: `${slot4BrandConfig.siteName} keeps a local directory of trusted places and a curated reference library in one calm home — so discovery feels like reading, not hunting.`,
    paragraphs: [
      'Instead of splitting places, guides and references into disconnected surfaces, we keep them connected — you can move between them without losing context.',
      'Every entry is tagged, filed and cross-checked. Every section shares the same rhythm, so you always know where you are.',
    ],
    values: [
      {
        title: 'Calm discovery',
        description: 'We prioritize clarity and pacing — browsing without visual noise.',
      },
      {
        title: 'Connected surfaces',
        description: 'Places, references and features stay in one home, one rhythm.',
      },
      {
        title: 'Simple + trustworthy',
        description: 'Clean navigation, honest metadata, no dark patterns.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Say hello — the right lane for your ask.',
    description: 'Tell us what you are trying to publish, submit or fix. We will route it through the right lane instead of forcing every request into the same bucket.',
    formTitle: 'Send a message',
  },

  search: {
    metadata: {
      title: 'Search',
      description: 'Search across places, references, categories and content.',
    },
    hero: {
      badge: 'Search the archive',
      title: 'Find places, references and entries — faster.',
      description: 'Use keywords, categories and section types to discover entries from every active surface.',
      placeholder: 'Search by keyword, category, or title',
    },
    resultsTitle: 'Latest searchable entries',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Publish a new entry to the site.',
    },
    locked: {
      badge: 'Contributor access',
      title: 'Sign in to add a new entry.',
      description: 'Use your account to open the workspace and add a new entry to any active section.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Add a new entry to the site.',
      description: 'Choose the section, add details and prepare a clean entry with images, links, summary and body content.',
    },
    formTitle: 'Entry details',
    submitLabel: 'Publish entry',
    successTitle: 'Entry submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to your account.',
      badge: 'Member access',
      title: 'Welcome back.',
      description: 'Sign in to continue browsing, manage submissions and add new entries.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched those details. Create an account first, then sign in.',
      success: 'Signed in. Redirecting…',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create an account.',
      badge: 'Site access',
      title: 'Create your account.',
      description: 'Create an account to access the workspace, save details, and add entries to the site.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting…',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related entries',
      fallbackTitle: 'Entry details',
    },
    listing: {
      relatedTitle: 'More directory entries',
      fallbackTitle: 'Directory entry',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Visual entry',
    },
    profile: {
      relatedTitle: 'Suggested reads',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
