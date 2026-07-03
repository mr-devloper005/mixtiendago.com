import Link from 'next/link'
import { ArrowUpRight, Sparkles, Compass, BookOpen, MapPin, Layers } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, getEditableExcerpt, getEditableCategory, postHref } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

// Display-label rename map (task keys unchanged; user-visible strings only).
const DISPLAY_LABELS: Record<string, string> = {
  article: 'Editorial',
  listing: 'Local Directory',
  classified: 'Marketplace',
  image: 'Visuals',
  sbm: 'Bookmarks',
  pdf: 'Reference Library',
  profile: 'People',
}
const displayLabelFor = (key: string, fallback: string) => DISPLAY_LABELS[key] || fallback

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function ArrowOrb({ tone = 'accent' }: { tone?: 'accent' | 'light' | 'dark' }) {
  const cls =
    tone === 'light'
      ? 'bg-white/15 text-white'
      : tone === 'dark'
      ? 'bg-[var(--slot4-accent)] text-white'
      : 'bg-[var(--slot4-accent-tint)] text-[var(--slot4-accent)]'
  return (
    <span className={`ml-1 flex h-8 w-8 items-center justify-center rounded-full ${cls}`}>
      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} />
    </span>
  )
}

/* ------------------------------- Hero ------------------------------- */
export function EditableHomeHero({ primaryRoute }: HomeSectionProps) {
  const badge = pagesContent.home.hero.badge || 'A calmer home for local discovery'
  return (
    <section className="relative overflow-hidden">
      {/* Ambient blue wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[linear-gradient(180deg,var(--slot4-accent-soft)_0%,var(--slot4-page-bg)_92%)]" />
      <div className={`${container} pb-16 pt-14 sm:pb-24 sm:pt-20 lg:pb-32 lg:pt-28`}>
        <EditableReveal>
          <span className={`${dc.badge.pill} mb-8 sm:mb-10`}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" /> {badge}
          </span>
        </EditableReveal>

        {/* Giant display line, echoes Arooth's "VISION" hero */}
        <EditableReveal index={1}>
          <h1 className="editable-display text-balance text-[3.25rem] font-medium leading-[0.98] tracking-[-0.035em] sm:text-[5.5rem] lg:text-[7.75rem]">
            DISCOVER
            <br />
            <span className="editable-highlight">every corner.</span>
          </h1>
        </EditableReveal>

        <div className="mt-14 grid gap-10 sm:mt-20 lg:grid-cols-[1fr_auto] lg:items-end">
          <EditableReveal index={2} className="max-w-xl">
            <p className={`${dc.type.body} text-[15px] sm:text-base`}>
              {pagesContent.home.hero.description ||
                `At ${SITE_CONFIG.name}, we bring together a local directory of trusted places and a curated reference library — so every visit turns into a real find, and every read leaves you with something to keep.`}
            </p>
          </EditableReveal>
          <EditableReveal index={3}>
            <Link href={primaryRoute} className={dc.button.primary}>
              Start exploring <ArrowOrb tone="light" />
            </Link>
          </EditableReveal>
        </div>
      </div>
    </section>
  )
}

/* -------------------- Value / About band -------------------- */
export function EditableAboutBand() {
  return (
    <section className={`${container} py-[3.75rem] sm:py-[5rem] lg:py-[7.5rem]`}>
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <EditableReveal>
          <p className={dc.type.eyebrow}>What we do</p>
          <h2 className={`${dc.type.sectionTitle} mt-4`}>
            Trusted places <span className="editable-highlight">meet useful reads.</span>
          </h2>
        </EditableReveal>
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { Icon: MapPin, title: 'Local directory', body: 'Real places, verified by the community, filed with clear category tags and quick-facts.' },
            { Icon: BookOpen, title: 'Reference library', body: 'Downloadable guides, reports and reference material — kept useful, kept current.' },
            { Icon: Compass, title: 'Calm discovery', body: 'Section rhythm designed for browsing without noise, so exploring feels like reading.' },
            { Icon: Layers, title: 'One connected home', body: 'Move between places, references and features without losing your thread.' },
          ].map((item, i) => (
            <EditableReveal key={item.title} index={i}>
              <div className={`${dc.surface.soft} h-full p-7`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                  <item.Icon className="h-5 w-5" />
                </span>
                <h3 className="editable-display mt-6 text-xl font-medium tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{item.body}</p>
              </div>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------- Story rail (categories) -------------------- */
export function EditableStoryRail({ primaryRoute }: HomeSectionProps) {
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled)
  if (!categories.length) return null

  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`${container} py-[3.75rem] sm:py-[5rem] lg:py-[6rem]`}>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <EditableReveal>
            <span className={dc.badge.softPill}>
              <Sparkles className="h-3.5 w-3.5" /> Explore
            </span>
            <h2 className={`${dc.type.sectionTitle} mt-5`}>
              Every kind of <span className="editable-highlight">entry.</span>
            </h2>
          </EditableReveal>
          <EditableReveal index={1}>
            <Link href={primaryRoute} className={dc.button.secondary}>
              Browse everything <ArrowOrb />
            </Link>
          </EditableReveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((task, i) => (
            <EditableReveal key={task.key} index={i}>
              <Link
                href={task.route}
                className="group flex h-full flex-col justify-between gap-8 rounded-[var(--slot4-radius-md)] bg-[var(--slot4-surface-bg)] p-8 shadow-[0_4px_20px_rgba(0,64,193,0.05)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,64,193,0.12)]"
              >
                <span className="editable-display text-4xl font-medium tracking-[-0.02em] text-[var(--slot4-accent)] sm:text-5xl">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="editable-display text-2xl font-medium tracking-[-0.02em]">
                    {displayLabelFor(task.key, task.label)}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">
                    Browse the latest entries in this section.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--slot4-accent)]">
                    Open section <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------- Recent activity split -------------------- */
function CoverCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-[var(--slot4-radius-md)] bg-[var(--slot4-panel-bg)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,64,193,0.12)]">
      <div className={`${dc.media.frame} aspect-[4/5]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-page-text)]">
          {getEditableCategory(post)}
        </span>
      </div>
      <div className="p-6">
        <span className="editable-display text-3xl font-medium tracking-[-0.02em] text-[var(--slot4-accent)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="editable-display mt-4 line-clamp-2 text-xl font-medium leading-tight tracking-[-0.02em]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">
          {getEditableExcerpt(post, 130)}
        </p>
      </div>
    </Link>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const activity = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 6)
  if (!activity.length) return null

  return (
    <section className={`${container} py-[3.75rem] sm:py-[5rem] lg:py-[7.5rem]`}>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <EditableReveal>
          <span className={dc.badge.softPill}>
            <Sparkles className="h-3.5 w-3.5" /> Latest entries
          </span>
          <h2 className={`${dc.type.sectionTitle} mt-5`}>
            Fresh finds <span className="editable-highlight">this week.</span>
          </h2>
        </EditableReveal>
        <EditableReveal index={1}>
          <Link href={primaryRoute} className={dc.button.secondary}>
            View all <ArrowOrb />
          </Link>
        </EditableReveal>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activity.map((post, i) => (
          <EditableReveal key={post.id || post.slug} index={i}>
            <CoverCard post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
          </EditableReveal>
        ))}
      </div>
    </section>
  )
}

/* -------------------- Numbered projects (Arooth "01 / 02") -------------------- */
export function EditableFeaturedProjects({ primaryTask, primaryRoute, posts }: HomeSectionProps) {
  const featured = posts.slice(0, 4)
  if (!featured.length) return null

  return (
    <section className={`${container} py-[3.75rem] sm:py-[5rem] lg:py-[6rem]`}>
      <EditableReveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className={dc.badge.softPill}>
              <Layers className="h-3.5 w-3.5" /> In the spotlight
            </span>
            <h2 className={`${dc.type.sectionTitle} mt-5`}>
              Latest <span className="editable-highlight">entries.</span>
            </h2>
          </div>
          <Link href={primaryRoute} className={dc.button.secondary}>
            View all <ArrowOrb />
          </Link>
        </div>
      </EditableReveal>

      <div className="mt-14 grid gap-16 sm:grid-cols-2 sm:gap-x-10 lg:mt-20 lg:gap-x-20 lg:gap-y-24">
        {featured.map((post, i) => (
          <EditableReveal key={post.id || post.slug} index={i}>
            <Link
              href={postHref(primaryTask, post, primaryRoute)}
              className={`group grid gap-6 ${i % 2 === 1 ? 'sm:mt-24' : ''}`}
            >
              <span className="editable-display text-[3.5rem] font-medium leading-none tracking-[-0.03em] sm:text-[5rem] lg:text-[7rem]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className={`${dc.media.frame} aspect-[4/5]`}>
                <img
                  src={getEditablePostImage(post)}
                  alt={post.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
              </div>
              <div>
                <span className={dc.badge.softPill}>{getEditableCategory(post)}</span>
                <h3 className="editable-display mt-4 line-clamp-2 text-2xl font-medium leading-tight tracking-[-0.02em] sm:text-3xl">
                  {post.title}
                </h3>
              </div>
            </Link>
          </EditableReveal>
        ))}
      </div>
    </section>
  )
}

/* -------------------- Time-based collections -------------------- */
const sectionCopy: Record<string, { eyebrow: string; title: string; highlight: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'New in the last', highlight: '7 days.' },
  browse: { eyebrow: 'Trending now', title: 'Popular this', highlight: 'month.' },
  index: { eyebrow: 'Evergreen', title: 'From the', highlight: 'archive.' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, sIndex) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to', highlight: 'explore.' }
        return (
          <section key={section.key} className={sIndex % 2 === 0 ? '' : 'bg-[var(--slot4-panel-bg)]'}>
            <div className={`${container} py-[3.75rem] sm:py-[5rem] lg:py-[6rem]`}>
              <EditableReveal>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span className={dc.badge.softPill}>{copy.eyebrow}</span>
                    <h2 className={`${dc.type.sectionTitle} mt-5`}>
                      {copy.title} <span className="editable-highlight">{copy.highlight}</span>
                    </h2>
                  </div>
                  <Link href={section.href || primaryRoute} className={dc.button.secondary}>
                    See all <ArrowOrb />
                  </Link>
                </div>
              </EditableReveal>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post, i) => (
                  <EditableReveal key={post.id || post.slug} index={i}>
                    <Link
                      href={postHref(primaryTask, post, primaryRoute)}
                      className="group block overflow-hidden rounded-[var(--slot4-radius-md)] bg-[var(--slot4-surface-bg)] shadow-[0_4px_20px_rgba(0,64,193,0.04)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,64,193,0.12)]"
                    >
                      <div className={`${dc.media.frame} aspect-[4/3]`}>
                        <img
                          src={getEditablePostImage(post)}
                          alt={post.title}
                          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5">
                        <p className={dc.type.eyebrow}>{getEditableCategory(post)}</p>
                        <h3 className="editable-display mt-2 line-clamp-2 text-lg font-medium leading-snug tracking-[-0.02em]">
                          {post.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-[var(--slot4-muted-text)]">
                          {getEditableExcerpt(post, 110)}
                        </p>
                      </div>
                    </Link>
                  </EditableReveal>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* -------------------- Stats band -------------------- */
export function EditableStatsBand({ posts, timeSections }: HomeSectionProps) {
  const merged = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const categories = new Set<string>()
  for (const post of merged) {
    const c = getEditableCategory(post)
    if (c) categories.add(c)
  }
  const stats = [
    { value: String(merged.length || SITE_CONFIG.tasks.length * 6), label: 'Entries in rotation' },
    { value: String(categories.size || SITE_CONFIG.tasks.length), label: 'Categories tracked' },
    { value: String(SITE_CONFIG.tasks.filter((t) => t.enabled).length), label: 'Sections to browse' },
    { value: '24/7', label: 'Always available' },
  ]

  return (
    <section className="bg-[var(--slot4-accent-soft)]">
      <div className={`${container} py-[3.75rem] sm:py-[5rem]`}>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <EditableReveal key={s.label} index={i}>
              <div>
                <p className="editable-display text-4xl font-medium tracking-[-0.03em] text-[var(--slot4-accent)] sm:text-5xl lg:text-6xl">
                  {s.value}
                </p>
                <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">
                  {s.label}
                </p>
              </div>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------- Final CTA -------------------- */
export function EditableHomeCta() {
  return (
    <section className={`${container} py-[5rem] sm:py-[6rem]`}>
      <EditableReveal>
        <div className="rounded-[var(--slot4-radius-lg)] bg-[var(--slot4-dark-bg)] px-8 py-14 text-center sm:px-16 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white">
            <Sparkles className="h-3.5 w-3.5" /> Add something
          </span>
          <h2 className="editable-display mx-auto mt-6 max-w-3xl text-[2.25rem] font-medium leading-[1.05] tracking-[-0.03em] text-white sm:text-[3.5rem] lg:text-[4.25rem]">
            Have something <span className="italic text-[var(--slot4-accent-tint)]">worth sharing?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/80">
            Add a place to the directory, publish a guide to the reference library, or drop a story into the feed.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/create" className="inline-flex items-center gap-1 rounded-full bg-white pl-6 pr-2 py-2 text-sm font-medium text-[var(--slot4-page-text)] transition hover:brightness-95">
              Add an entry
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--slot4-accent-tint)] text-[var(--slot4-accent)]">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Contact us
            </Link>
          </div>
        </div>
      </EditableReveal>
    </section>
  )
}

// Suppress unused-import warning (pal kept for downstream tokens if needed).
export const _paletteRef = pal
