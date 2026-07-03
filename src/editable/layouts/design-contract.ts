import type { CSSProperties } from 'react'

/*
  Arooth-inspired design system.

  Palette, radii, type scale, section rhythm and button shapes are extracted
  from arooth.webflow.io. Downstream components consume these via CSS vars —
  never hardcode the reference's colors, radii or fonts in JSX.
*/

export const editableRootStyle = {
  // Page + surfaces (soft blue tinted panels are the recurring surface)
  '--slot4-page-bg': '#ffffff',
  '--slot4-page-text': '#090909',
  '--slot4-panel-bg': '#f5faff',
  '--slot4-surface-bg': '#ffffff',
  '--slot4-muted-text': '#4b5563',
  '--slot4-soft-muted-text': '#6b7280',
  '--slot4-accent': '#0040c1',
  '--slot4-accent-fill': '#0040c1',
  '--slot4-accent-alt': '#2970ff',
  '--slot4-accent-soft': '#eff4ff',
  '--slot4-accent-tint': '#d1e0ff',
  '--slot4-on-accent': '#ffffff',
  '--slot4-dark-bg': '#00359e',
  '--slot4-dark-text': '#ffffff',
  '--slot4-media-bg': '#d1e0ff',
  '--slot4-cream': '#ffffff',
  '--slot4-warm': '#f5faff',
  '--slot4-lavender': '#eff4ff',
  '--slot4-gray': '#f9f9f9',
  '--slot4-body-gradient': 'none',
  '--editable-page-bg': '#ffffff',
  '--editable-page-text': '#090909',
  '--editable-container': '1400px',
  '--editable-border': 'rgba(9,9,9,0.08)',
  '--editable-nav-bg': '#ffffff',
  '--editable-nav-text': '#090909',
  '--editable-nav-active': '#0040c1',
  '--editable-nav-active-text': '#0040c1',
  '--editable-cta-bg': '#0040c1',
  '--editable-cta-text': '#ffffff',
  '--editable-search-bg': '#f5faff',
  '--editable-footer-bg': '#f5faff',
  '--editable-footer-text': '#090909',
  // Section rhythm (Arooth 3.75 / 5 / 7.5 rem)
  '--slot4-section-gap-sm': '3.75rem',
  '--slot4-section-gap-md': '5rem',
  '--slot4-section-gap-lg': '7.5rem',
  // Radii — buttons are pills (6.25rem)
  '--slot4-radius-pill': '6.25rem',
  '--slot4-radius-lg': '2rem',
  '--slot4-radius-md': '1.5rem',
  '--slot4-radius-sm': '1rem',
  '--slot4-radius-xs': '0.625rem',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  accentTintBg: 'bg-[var(--slot4-accent-tint)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/10',
  shadow: 'shadow-[0_8px_28px_rgba(0,64,193,0.06)]',
  shadowStrong: 'shadow-[0_24px_60px_rgba(0,64,193,0.12)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(0,64,193,0.05),rgba(0,53,158,0.72))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12',
    sectionY: 'py-[3.75rem] sm:py-20 lg:py-[7.5rem]',
    sectionYSm: 'py-14 sm:py-16 lg:py-[5rem]',
  },
  layout: {
    safeGrid: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[280px] shrink-0 snap-start sm:w-[320px]',
  },
  type: {
    // Poppins body + Instrument Sans display.
    eyebrow: 'text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-accent)]',
    display: 'editable-display text-[3.5rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[5rem] lg:text-[7.5rem]',
    heroTitle: 'editable-display text-[2.75rem] font-medium leading-[1.05] tracking-[-0.025em] sm:text-[3.75rem] lg:text-[4.75rem]',
    sectionTitle: 'editable-display text-[2rem] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[2.75rem] lg:text-[3.25rem]',
    body: 'text-base leading-[1.7] text-[var(--slot4-muted-text)]',
    emphasis: 'text-[var(--slot4-accent)]',
  },
  surface: {
    // Soft tinted panels (Arooth uses tint + soft shadow, not hard borders)
    card: `rounded-[var(--slot4-radius-md)] bg-[var(--slot4-panel-bg)] ${editablePalette.shadow}`,
    soft: `rounded-[var(--slot4-radius-md)] bg-[var(--slot4-panel-bg)]`,
    outlined: `rounded-[var(--slot4-radius-md)] border ${editablePalette.border} bg-[var(--slot4-surface-bg)]`,
    dark: `rounded-[var(--slot4-radius-lg)] ${editablePalette.darkBg} ${editablePalette.darkText} ${editablePalette.shadowStrong}`,
  },
  button: {
    // Pill (Arooth signature) — dark blue fill with lighter blue "arrow orb"
    primary:
      'inline-flex items-center justify-center gap-2.5 rounded-full bg-[var(--slot4-accent-fill)] pl-6 pr-2 py-2 text-sm font-medium text-[var(--slot4-on-accent)] transition duration-300 hover:brightness-110 active:scale-[0.98]',
    secondary:
      'inline-flex items-center justify-center gap-2.5 rounded-full bg-[var(--slot4-accent-soft)] pl-6 pr-2 py-2 text-sm font-medium text-[var(--slot4-page-text)] transition duration-300 hover:bg-[var(--slot4-accent-tint)] active:scale-[0.98]',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-medium text-[var(--slot4-on-accent)] transition duration-300 hover:brightness-110',
    ghost:
      'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-[var(--slot4-page-text)] transition duration-300 hover:bg-[var(--slot4-accent-soft)]',
  },
  badge: {
    pill: 'inline-flex items-center gap-2 rounded-full bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-page-text)] shadow-[0_2px_10px_rgba(0,64,193,0.06)]',
    accentPill:
      'inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-accent)]',
    softPill:
      'inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-accent)]',
  },
  media: {
    // Soft blue tinted media frame — the Arooth signature
    frame: 'relative overflow-hidden rounded-[var(--slot4-radius-md)] bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))]',
    frameFull: 'relative overflow-hidden rounded-[var(--slot4-radius-lg)] bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))]',
    ratio: 'aspect-[4/5]',
    ratioWide: 'aspect-[16/10]',
  },
  motion: {
    lift: 'transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,64,193,0.14)]',
    fade: 'transition duration-500 hover:opacity-90',
    zoom: 'transition duration-700 group-hover:scale-[1.03]',
  },
} as const

export const aiLayoutRules = [
  'Change site-wide colors in editableRootStyle first — every section consumes CSS vars.',
  'Keep home page structure in HomeSections.tsx so it can be redesigned in one file.',
  'Use pill-shaped buttons and soft blue tinted panels as the recurring surface.',
  'Never hardcode reference colors or fonts inside individual JSX files.',
  'Preserve dynamic post fetching — do not replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const
