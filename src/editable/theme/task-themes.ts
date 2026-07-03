import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Arooth-inspired task surfaces.

  Every task shares the same premium visual language — soft blue tinted panels,
  Instrument Sans display + Poppins body, pill-shaped accents. Only the kicker
  + note copy varies per task so each section keeps a little voice.

  Renamed labels (display-only, task keys unchanged):
   - listing → "Local Directory"
   - pdf     → "Reference Library"
*/

export type TaskTheme = {
  /** short flavour word shown as an eyebrow kicker */
  kicker: string
  /** one-line mood note for the page intro */
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const AROOTH_DISPLAY = "'Instrument Sans', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
const AROOTH_BODY = "'Poppins', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: AROOTH_DISPLAY,
  fontBody: AROOTH_BODY,
  bg: '#ffffff',
  surface: '#ffffff',
  raised: '#f5faff',
  text: '#090909',
  muted: '#4b5563',
  line: 'rgba(9,9,9,0.08)',
  accent: '#0040c1',
  accentSoft: '#eff4ff',
  onAccent: '#ffffff',
  glow: 'rgba(0,64,193,0.10)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Editorial', note: 'Deep reads, guides and stories worth your time.' },
  listing: { ...base, kicker: 'Local Directory', note: 'Find, compare and connect with trusted places nearby.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Fresh offers and listings, ready to act on.' },
  image: { ...base, kicker: 'Visuals', note: 'A curated feed of standout images and galleries.' },
  sbm: { ...base, kicker: 'Bookmarks', note: 'Curated resources and links worth keeping.' },
  pdf: { ...base, kicker: 'Reference Library', note: 'Downloadable guides, reports and reference material.' },
  profile: { ...base, kicker: 'People', note: 'Discover the makers, businesses and voices behind each entry.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
