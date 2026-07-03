import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { pagesContent } from '@/editable/content/pages.content'
import { Ads, getSlotSizes } from '@/lib/ads'
import { formatRichHtml } from '@/components/shared/rich-content'

export const revalidate = 3

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
const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) =>
  typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images)
    ? (content.images.find((item) => typeof item === 'string') as string | undefined)
    : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) =>
  post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [
    post.title,
    post.summary,
    content.description,
    content.body,
    content.excerpt,
    content.category,
    Array.isArray(post.tags) ? post.tags.join(' ') : '',
  ].some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = displayLabelFor(task || '', SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Entry')
  const strong = index % 5 === 0

  return (
    <Link
      href={href}
      className={`group block overflow-hidden rounded-[var(--slot4-radius-md)] bg-[var(--slot4-panel-bg)] shadow-[0_4px_20px_rgba(0,64,193,0.05)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,64,193,0.14)] ${
        strong ? 'md:col-span-2' : ''
      }`}
    >
      {image ? (
        <div
          className={`relative overflow-hidden bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))] ${
            strong ? 'aspect-[16/7]' : 'aspect-[16/10]'
          }`}
        >
          <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-page-text)]">
            {taskLabel}
          </span>
        </div>
      ) : null}
      <div className="p-6 sm:p-7">
        {!image ? (
          <span className="rounded-full bg-[var(--slot4-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-accent)]">
            {taskLabel}
          </span>
        ) : null}
        <h2 className="editable-display mt-4 line-clamp-3 text-2xl font-medium leading-tight tracking-[-0.02em]">
          {post.title}
        </h2>
       {summary ? <div className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]" dangerouslySetInnerHTML={{ __html: formatRichHtml(summary) }} /> : null}
        <span className="mt-5 inline-flex items-center gap-1 rounded-full bg-[var(--slot4-accent-soft)] pl-4 pr-1 py-1 text-sm font-medium text-[var(--slot4-accent)]">
          Open entry
          <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-white">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
        </span>
      </div>
    </Link>
  )
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }>
}) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(
    useMaster ? 1000 : 300,
    useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined
  )
  const posts = feed?.posts?.length
    ? feed.posts
    : useMaster
    ? []
    : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${container} py-14 sm:py-20 lg:py-24`}>
          <EditableReveal>
            <div className="grid gap-8 rounded-[var(--slot4-radius-lg)] bg-[var(--slot4-panel-bg)] p-7 shadow-[0_8px_28px_rgba(0,64,193,0.06)] md:grid-cols-[0.9fr_1.1fr] lg:p-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] shadow-[0_2px_10px_rgba(0,64,193,0.06)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
                  {pagesContent.search.hero.badge}
                </span>
                <h1 className="editable-display mt-6 text-[2.5rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[4rem] lg:text-[5rem]">
                  Find <span className="editable-highlight">everything.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-[var(--slot4-muted-text)]">
                  {pagesContent.search.hero.description}
                </p>
              </div>
              <form action="/search" className="self-end rounded-[var(--slot4-radius-md)] bg-[var(--slot4-surface-bg)] p-5 shadow-[0_4px_20px_rgba(0,64,193,0.05)]">
                <input type="hidden" name="master" value="1" />
                <label className="flex items-center gap-3 rounded-full bg-[var(--slot4-accent-soft)] px-5 py-3">
                  <Search className="h-5 w-5 text-[var(--slot4-accent)]" />
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder={pagesContent.search.hero.placeholder}
                    className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-[var(--slot4-muted-text)]"
                  />
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-5 py-3">
                    <Filter className="h-4 w-4 text-[var(--slot4-accent)]" />
                    <input
                      name="category"
                      defaultValue={category}
                      placeholder="Category"
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--slot4-muted-text)]"
                    />
                  </label>
                  <select
                    name="task"
                    defaultValue={task}
                    className="rounded-full bg-[var(--slot4-accent-soft)] px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none"
                  >
                    <option value="">All sections</option>
                    {enabledTasks.map((item) => (
                      <option key={item.key} value={item.key}>
                        {displayLabelFor(item.key, item.label)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-1 rounded-full bg-[var(--slot4-accent-fill)] pl-6 pr-2 text-sm font-medium text-white transition hover:brightness-110"
                  type="submit"
                >
                  Search
                  <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                </button>
              </form>
            </div>
          </EditableReveal>

          <EditableReveal index={1}>
            <div className="mt-14 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
                  {results.length} results
                </p>
                <h2 className="editable-display mt-3 text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
                  {query ? `Results for “${query}”` : pagesContent.search.resultsTitle}
                </h2>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded-full bg-[var(--slot4-accent-soft)] pl-5 pr-1 py-1 text-sm font-medium text-[var(--slot4-page-text)]"
              >
                Back home
                <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-white">
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
              </Link>
            </div>
          </EditableReveal>

          {results.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index % 6}>
                  <SearchResultCard post={post} index={index} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[var(--slot4-radius-md)] bg-[var(--slot4-panel-bg)] p-12 text-center">
              <p className="editable-display text-2xl font-medium tracking-[-0.02em]">No matches found.</p>
              <p className="mt-3 text-sm text-[var(--slot4-muted-text)]">
                Try a different keyword, section, or category.
              </p>
            </div>
          )}

          {/* Search page → footer ad (per spec) */}
          <div className="mt-16">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
