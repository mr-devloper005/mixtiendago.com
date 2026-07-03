import Link from 'next/link'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  Download,
  FileText,
  Globe,
  MapPin,
  Phone,
  Search,
  UserRound,
} from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

// Display-label rename map (task keys unchanged; only user-visible strings change).
const DISPLAY_LABELS: Record<TaskKey, string> = {
  article: 'Editorial',
  listing: 'Local Directory',
  classified: 'Marketplace',
  image: 'Visuals',
  sbm: 'Bookmarks',
  pdf: 'Reference Library',
  profile: 'People',
}
const displayLabelFor = (task: TaskKey, fallback: string) => DISPLAY_LABELS[task] || fallback

// Singular entry noun (for empty states, "1 entry" counts, etc.)
const ENTRY_NOUN: Record<TaskKey, string> = {
  article: 'entry',
  listing: 'place',
  classified: 'offer',
  image: 'visual',
  sbm: 'bookmark',
  pdf: 'reference',
  profile: 'profile',
}

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) =>
  stripHtml(
    post.summary ||
      asText(getContent(post).description) ||
      asText(getContent(post).excerpt) ||
      asText(getContent(post).body)
  )
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-7 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const cardBase =
  'group block rounded-[var(--tk-radius)] bg-[var(--tk-raised)] shadow-[0_4px_20px_rgba(0,64,193,0.05)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,64,193,0.14)]'

/* ---------------- Ad in-feed cell (used for listing archive) ---------------- */
function InFeedAdCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--tk-radius)] bg-[var(--tk-raised)] p-5">
      {children}
    </div>
  )
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return (
    <TaskArchiveView
      task={task}
      posts={posts}
      pagination={pagination}
      category={category}
      basePath={basePath || taskConfig?.route || `/${task}`}
    />
  )
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = displayLabelFor(task, taskConfig?.label || task)
  const entryNoun = ENTRY_NOUN[task] || 'entry'
  const categoryLabel =
    category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[linear-gradient(180deg,var(--tk-accent-soft)_0%,var(--tk-bg)_92%)]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-5 pt-14 sm:px-8 sm:pt-20 lg:px-12 lg:pt-28">
            <EditableReveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-surface)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-page-text)] shadow-[0_2px_10px_rgba(0,64,193,0.06)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--tk-accent)]" />
                {theme.kicker}
              </span>
            </EditableReveal>
            <EditableReveal index={1}>
              <h1 className="editable-display mt-8 max-w-4xl text-balance text-[3rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[5rem] lg:text-[6.5rem]">
                {label.toUpperCase()}
              </h1>
            </EditableReveal>
            <EditableReveal index={2}>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">
                {voice?.description || theme.note}
              </p>
            </EditableReveal>
            {voice?.chips?.length ? (
              <EditableReveal index={3}>
                <div className="mt-10 flex flex-wrap gap-2.5">
                  {voice.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-[var(--tk-surface)] px-4 py-1.5 text-xs font-medium text-[var(--tk-muted)] shadow-[0_2px_10px_rgba(0,64,193,0.05)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </EditableReveal>
            ) : null}

            <div className="mt-12 flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--tk-muted)]">
                <span className="font-semibold text-[var(--tk-text)]">{posts.length}</span>{' '}
                {posts.length === 1 ? entryNoun : `${entryNoun}s`} · {categoryLabel}
              </p>
              <form action={basePath} className="flex items-center gap-2.5">
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-11 appearance-none rounded-full bg-[var(--tk-surface)] pl-5 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none shadow-[0_2px_10px_rgba(0,64,193,0.06)] transition focus:ring-2 focus:ring-[var(--tk-accent)]/40"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className="inline-flex h-11 items-center rounded-full bg-[var(--tk-accent)] px-6 text-sm font-medium text-[var(--tk-on-accent)] transition hover:brightness-110">
                  Apply
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Reference-Library archive → header ad (per spec) */}
        {task === 'pdf' ? (
          <div className="mx-auto max-w-[var(--editable-container)] px-5 pt-10 sm:px-8 lg:px-12">
            <Ads slot="header" size={pickRandom(getSlotSizes('header'))} showLabel />
          </div>
        ) : null}

        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => (
                <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />
              ))}
              {/* Listing archive → in-feed ad (per spec) */}
              {task === 'listing' ? (
                <InFeedAdCell>
                  <Ads slot="in-feed" size={pickRandom(getSlotSizes('in-feed'))} showLabel />
                </InFeedAdCell>
              ) : null}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[var(--tk-radius)] bg-[var(--tk-raised)] px-10 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-6 text-2xl font-medium tracking-[-0.02em]">Nothing here yet</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--tk-muted)]">
                Try another category, or check back after new {label.toLowerCase()} entries are added.
              </p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-16 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? (
                <Link
                  href={pageHref(basePath, category, page - 1)}
                  className="rounded-full bg-[var(--tk-raised)] px-6 py-2.5 font-medium transition hover:bg-[var(--tk-accent-soft)]"
                >
                  Previous
                </Link>
              ) : null}
              <span className="rounded-full bg-[var(--tk-surface)] px-6 py-2.5 font-medium text-[var(--tk-muted)] shadow-[0_2px_10px_rgba(0,64,193,0.05)]">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link
                  href={pageHref(basePath, category, page + 1)}
                  className="rounded-full bg-[var(--tk-accent)] px-6 py-2.5 font-medium text-[var(--tk-on-accent)] transition hover:brightness-110"
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({
  post,
  task,
  basePath,
  index,
}: {
  post: SitePost
  task: TaskKey
  basePath: string
  index: number
}) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  return (
    <EditableReveal index={index % 6}>
      {task === 'listing' ? <ListingArchiveCard post={post} href={href} /> : null}
      {task === 'classified' ? <ClassifiedArchiveCard post={post} href={href} /> : null}
      {task === 'image' ? <ImageArchiveCard post={post} href={href} index={index} /> : null}
      {task === 'sbm' ? <BookmarkArchiveCard post={post} href={href} index={index} /> : null}
      {task === 'pdf' ? <PdfArchiveCard post={post} href={href} /> : null}
      {task === 'profile' ? <ProfileArchiveCard post={post} href={href} /> : null}
      {task === 'article' ? <ArticleArchiveCard post={post} href={href} index={index} /> : null}
    </EditableReveal>
  )
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-6 inline-flex items-center gap-1 rounded-full bg-[var(--tk-accent-soft)] pl-4 pr-1 py-1 text-sm font-medium text-[var(--tk-accent)]">
      {label}
      <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tk-accent)] text-[var(--tk-on-accent)]">
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
    </span>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Editorial')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))]">
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-7 sm:p-8">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-accent)]">
          <span>{category}</span>
          <span className="text-[var(--tk-muted)]">· {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h2 className="editable-display mt-3 text-2xl font-medium leading-snug tracking-[-0.02em]">{post.title}</h2>
        <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <CardArrow label="Read entry" />
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex items-center gap-6 p-6 sm:p-7`}>
      <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))]">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <BriefcaseBusiness className="h-10 w-10 text-[var(--tk-accent)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display truncate text-xl font-medium tracking-[-0.02em] sm:text-2xl">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-[var(--tk-muted)]">
          {location ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[var(--tk-accent)]">
              <MapPin className="h-3.5 w-3.5" /> {location}
            </span>
          ) : null}
          {phone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[var(--tk-accent)]">
              <Phone className="h-3.5 w-3.5" /> {phone}
            </span>
          ) : null}
          {website ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[var(--tk-accent)]">
              <Globe className="h-3.5 w-3.5" /> Website
            </span>
          ) : null}
        </div>
      </div>
      <ArrowUpRight className="h-6 w-6 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-7 sm:p-8`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-medium tracking-[-0.03em] text-[var(--tk-accent)]">
          {price || 'Open offer'}
        </span>
        {condition ? (
          <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">
            {condition}
          </span>
        ) : null}
      </div>
      <h2 className="editable-display mt-6 text-xl font-medium leading-snug tracking-[-0.02em]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-6 flex items-center justify-between pt-4 text-xs font-medium text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">
          {location ? (
            <>
              <MapPin className="h-3.5 w-3.5" /> {location}
            </>
          ) : (
            'Open location'
          )}
        </span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link
      href={href}
      className="group mb-5 block break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] bg-[var(--tk-raised)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,64,193,0.14)]"
    >
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,53,158,0.72))] opacity-90 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h2 className="editable-display line-clamp-2 text-lg font-medium leading-snug tracking-[-0.02em] text-white">
            {post.title}
          </h2>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/95 pl-3 pr-1 py-1 text-xs font-medium text-[var(--tk-text)]">
            View visual
            <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} flex gap-5 p-7`}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">
          Saved · {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="editable-display mt-2 text-lg font-medium leading-snug tracking-[-0.02em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? <p className="mt-3 truncate text-xs font-medium text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Reference')
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-7 sm:p-8`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <FileText className="h-6 w-6" />
        </div>
        <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">
          {category}
        </span>
      </div>
      <h2 className="editable-display mt-6 text-xl font-medium leading-snug tracking-[-0.02em]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-6 inline-flex items-center gap-1 rounded-full bg-[var(--tk-accent-soft)] pl-4 pr-1 py-1 text-sm font-medium text-[var(--tk-accent)]">
        Open reference
        <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tk-accent)] text-[var(--tk-on-accent)]">
          <Download className="h-3.5 w-3.5" />
        </span>
      </span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-8 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))]">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-10 w-10 text-[var(--tk-accent)]" />
        )}
      </div>
      <h2 className="editable-display mt-6 text-lg font-medium tracking-[-0.02em]">{post.title}</h2>
      {role ? (
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p>
      ) : null}
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
