import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

/*
  Voice per section — user-visible copy.

  Display-label rename (task keys unchanged):
   - listing → "Local Directory"
   - pdf     → "Reference Library"
*/
export const taskPageVoices = {
  article: {
    eyebrow: 'Editorial desk',
    headline: 'Long reads, guides and stories worth your time.',
    description: 'A calmer reading rhythm for essays, guides and story-led entries — the parts of the site that reward a slower pace.',
    filterLabel: 'Choose a topic',
    secondaryNote: 'Reading surfaces need space, hierarchy, and fewer distractions.',
    chips: ['Editorial pacing', 'Topic filters', 'Long-read friendly'],
  },
  classified: {
    eyebrow: 'Marketplace',
    headline: 'Fresh offers and time-sensitive posts.',
    description: 'Fast to scan, practical, action-oriented — less decoration, more signal.',
    filterLabel: 'Filter category',
    secondaryNote: 'Prioritize urgency, short summaries, and direct browsing.',
    chips: ['Fast scan', 'Fresh offers', 'Direct action'],
  },
  sbm: {
    eyebrow: 'Saved resources',
    headline: 'Curated bookmarks worth keeping close.',
    description: 'Shelves of useful resources, tools and references — grouped so you can revisit them without hunting.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Curated resources need grouping and calm metadata.',
    chips: ['Collections', 'Resources', 'Reference flow'],
  },
  profile: {
    eyebrow: 'People and profiles',
    headline: 'Discoverable makers, businesses and voices.',
    description: 'Identity, trust and reputation cues — so people, brands and entities feel visible rather than buried in a feed.',
    filterLabel: 'Filter profile category',
    secondaryNote: 'Make identity and credibility visible before the grid begins.',
    chips: ['Identity first', 'Trust cues', 'Creator + business'],
  },
  pdf: {
    eyebrow: 'Reference Library',
    headline: 'Downloadable guides, reports and reference material.',
    description: 'A quiet library shelf — every entry is a file you can open, keep, and return to when you need it.',
    filterLabel: 'Filter reference type',
    secondaryNote: 'Reference surfaces need archive cues, file context, and calm browsing.',
    chips: ['Downloadable', 'Guides', 'Archive ready'],
  },
  listing: {
    eyebrow: 'Local Directory',
    headline: 'Trusted places, verified by the community.',
    description: 'A local directory built for discovery — compare, visit, contact. Every entry checked, tagged and easy to browse.',
    filterLabel: 'Filter category',
    secondaryNote: 'Prioritize comparison, location, and direct action paths.',
    chips: ['Directory', 'Compare', 'Local discovery'],
  },
  image: {
    eyebrow: 'Visuals',
    headline: 'A gallery-first browsing rhythm.',
    description: 'Visual entries lead with impact — stronger cards, portfolio pacing, and space for the image to breathe.',
    filterLabel: 'Filter category',
    secondaryNote: 'Let images carry the page before long text does.',
    chips: ['Gallery-first', 'Portfolio mood', 'Visual clarity'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
