import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Building2,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Layers,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Tag,
  UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

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

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(
  task: TaskKey,
  params: Promise<{ slug?: string; username?: string }>
) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({
  task,
  params,
}: {
  task: TaskKey
  params: Promise<{ slug?: string; username?: string }>
}) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar']
    .map((key) => asText(content[key]))
    .filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getTags = (post: SitePost) => {
  const content = getContent(post)
  const tags = Array.isArray(content.tags) ? content.tags : []
  const merged = [...(post.tags || []), ...tags].filter((v): v is string => typeof v === 'string' && !!v.trim())
  return Array.from(new Set(merged)).slice(0, 8)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return (
    asText(content.body) ||
    asText(content.description) ||
    asText(content.details) ||
    post.summary ||
    'Details will appear here once available.'
  )
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const linkifyMarkdown = (value: string) =>
  value.replace(
    /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi,
    (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`
  )

const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(
    /(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi,
    (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`
  )

const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })

const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"')
  )

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) =>
  post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

/* ---------------------------- Shared building blocks ---------------------------- */
function ArrowOrb() {
  return (
    <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tk-accent)] text-[var(--tk-on-accent)]">
      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} />
    </span>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link
      href={taskConfig?.route || '/'}
      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tk-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--tk-accent)] transition hover:brightness-95"
    >
      <ArrowLeft className="h-4 w-4" /> Back to {displayLabelFor(task, taskConfig?.label || 'entries')}
    </Link>
  )
}

function TagChips({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-[var(--tk-accent-soft)] px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${
        compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'
      }`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-5 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt=""
            className="aspect-[4/3] rounded-[var(--tk-radius)] object-cover"
          />
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--tk-radius)] bg-[var(--tk-surface)] shadow-[0_4px_20px_rgba(0,64,193,0.06)]">
      <div className="flex items-center gap-2 p-5 text-sm font-medium">
        <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map'}
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

/* ------------------------------- Article ------------------------------- */
function ArticleDetail({
  post,
  related,
  comments,
}: {
  post: SitePost
  related: SitePost[]
  comments: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <BackLink task="article" />
        <Kicker task="article">{categoryOf(post, 'Editorial')}</Kicker>
        <h1 className="editable-display mt-6 text-balance text-[2.5rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[3.75rem] lg:text-[4.5rem]">
          {post.title}
        </h1>
        {leadText(post) ? (
          <p className="mt-8 text-xl leading-9 text-[var(--tk-muted)]">{leadText(post)}</p>
        ) : null}
        {images[0] ? (
          <img
            src={images[0]}
            alt=""
            className="mt-12 aspect-[16/9] w-full rounded-[var(--tk-radius)] object-cover"
          />
        ) : null}
        <BodyContent post={post} />
        <TagChips tags={getTags(post)} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

/* ------------------------------- Listing ------------------------------- */
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const heroImage = images[0]
  const galleryImages = images.slice(1, 7)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const hours = getField(post, ['hours', 'timings', 'openHours'])
  const mapSrc = mapSrcFor(post)
  const category = getField(post, ['category']) || 'Featured place'
  const tags = getTags(post)

  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <BackLink task="listing" />

      <EditableReveal>
        <div className="mt-8">
          <Kicker task="listing">{category}</Kicker>
          <h1 className="editable-display mt-6 text-balance text-[2.5rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[4rem] lg:text-[5rem]">
            {post.title}
          </h1>
          {leadText(post) ? (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p>
          ) : null}
        </div>
      </EditableReveal>

      {/* Prominent hero image (21:9 — cinematic like Arooth hero orbs) */}
      <EditableReveal index={1}>
        <div className="mt-12 aspect-[21/9] w-full overflow-hidden rounded-[var(--tk-radius)] bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))]">
          {heroImage ? (
            <img src={heroImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--tk-accent)]">
              <Building2 className="h-16 w-16" />
            </div>
          )}
        </div>
      </EditableReveal>

      {/* Quick-facts strip */}
      <EditableReveal index={2}>
        <div className="mt-8 grid grid-cols-2 gap-3 rounded-[var(--tk-radius)] bg-[var(--tk-raised)] p-6 sm:grid-cols-4">
          {[
            { Icon: MapPin, label: 'Location', value: address || 'Nearby' },
            { Icon: Phone, label: 'Phone', value: phone || 'On request' },
            { Icon: Clock, label: 'Hours', value: hours || 'Open today' },
            { Icon: ShieldCheck, label: 'Status', value: 'Verified' },
          ].map((item) => (
            <div key={item.label} className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
                <item.Icon className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {item.label}
              </div>
              <p className="mt-1.5 truncate text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </EditableReveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
        <article className="min-w-0">
          <EditableReveal index={3}>
            <h2 className="editable-display text-[2rem] font-medium tracking-[-0.02em] sm:text-[2.5rem]">
              About this <span className="editable-highlight">place.</span>
            </h2>
          </EditableReveal>
          <BodyContent post={post} />
          <TagChips tags={tags} />
          <ImageStrip images={galleryImages} label="Gallery" />
          {mapSrc ? (
            <div className="mt-12">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Find on the map</p>
              <div className="mt-5">
                <MapBox src={mapSrc} label={address || post.title} />
              </div>
            </div>
          ) : null}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Contact card */}
          <div className="rounded-[var(--tk-radius)] bg-[var(--tk-surface)] p-7 shadow-[0_8px_28px_rgba(0,64,193,0.08)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Get in touch</p>
            <div className="mt-5 grid gap-3 text-sm">
              {address ? (
                <a
                  href={mapSrc || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 rounded-[var(--slot4-radius-sm)] bg-[var(--tk-raised)] p-4 transition hover:bg-[var(--tk-accent-soft)]"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
                  <span className="min-w-0 break-words">{address}</span>
                </a>
              ) : null}
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="group flex items-start gap-3 rounded-[var(--slot4-radius-sm)] bg-[var(--tk-raised)] p-4 transition hover:bg-[var(--tk-accent-soft)]"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
                  <span>{phone}</span>
                </a>
              ) : null}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="group flex items-start gap-3 rounded-[var(--slot4-radius-sm)] bg-[var(--tk-raised)] p-4 transition hover:bg-[var(--tk-accent-soft)]"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
                  <span className="break-all">{email}</span>
                </a>
              ) : null}
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 rounded-[var(--slot4-radius-sm)] bg-[var(--tk-raised)] p-4 transition hover:bg-[var(--tk-accent-soft)]"
                >
                  <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
                  <span className="min-w-0 break-all">{website}</span>
                </a>
              ) : null}
              {hours ? (
                <div className="flex items-start gap-3 rounded-[var(--slot4-radius-sm)] bg-[var(--tk-raised)] p-4">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
                  <span>{hours}</span>
                </div>
              ) : null}
            </div>
            <Link
              href={website || `tel:${phone}` || '#'}
              className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-[var(--tk-accent)] pl-6 pr-2 py-2.5 text-sm font-medium text-[var(--tk-on-accent)] transition hover:brightness-110"
            >
              Contact this place <ArrowOrb />
            </Link>
          </div>

          {/* Trust panel */}
          <div className="rounded-[var(--tk-radius)] bg-[var(--tk-raised)] p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Why we trust it</p>
            <div className="mt-5 grid gap-3.5 text-sm">
              {[
                'Verified by the community',
                'Category and location confirmed',
                'Contact details cross-checked',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" /> <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Listing detail → sidebar ad (per spec) */}
          <div>
            <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel />
          </div>
        </aside>
      </div>

      <RelatedStrip task="listing" related={related} />
    </section>
  )
}

/* ------------------------------- Classified ------------------------------- */
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[var(--tk-radius)] bg-[var(--tk-surface)] p-7 shadow-[0_8px_28px_rgba(0,64,193,0.08)]">
            <Kicker task="classified">Marketplace</Kicker>
            <h1 className="editable-display mt-5 text-2xl font-medium leading-tight tracking-[-0.02em]">
              {post.title}
            </h1>
            <p className="editable-display mt-6 text-[3rem] font-medium tracking-[-0.03em] text-[var(--tk-accent)]">
              {price || 'Open offer'}
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-[var(--tk-muted)]">
              {condition ? (
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[var(--tk-accent)]" /> {condition}
                </div>
              ) : null}
              {location ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {location}
                </div>
              ) : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-medium text-[var(--tk-on-accent)] transition hover:brightness-110"
                >
                  <Phone className="h-4 w-4" /> Call now
                </a>
              ) : null}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent-soft)] px-5 py-2.5 text-sm font-medium text-[var(--tk-accent)] transition hover:brightness-95"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
              ) : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <TagChips tags={getTags(post)} />
          {website ? (
            <Link
              href={website}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-1 rounded-full bg-[var(--tk-accent-soft)] pl-5 pr-1 py-1 text-sm font-medium text-[var(--tk-accent)]"
            >
              Open external link <ArrowOrb />
            </Link>
          ) : null}
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

/* ------------------------------- Image ------------------------------- */
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure
                key={`${image}-${index}`}
                className="mb-5 break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] bg-[var(--tk-raised)]"
              >
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent-soft)] px-4 py-1.5 text-xs font-medium text-[var(--tk-accent)]">
              <Camera className="h-3.5 w-3.5" /> Visual story
            </span>
            <h1 className="editable-display mt-6 text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              {post.title}
            </h1>
            {leadText(post) ? (
              <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p>
            ) : null}
            <BodyContent post={post} compact />
            <TagChips tags={getTags(post)} />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

/* ------------------------------- Bookmark ------------------------------- */
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <Bookmark className="h-7 w-7" />
        </div>
        <div className="mt-6">
          <Kicker task="sbm">Saved resource</Kicker>
        </div>
        <h1 className="editable-display mt-5 text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-5xl">
          {post.title}
        </h1>
        {leadText(post) ? (
          <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p>
        ) : null}
        {website ? (
          <Link
            href={website}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-1 rounded-full bg-[var(--tk-accent)] pl-6 pr-2 py-2 text-sm font-medium text-[var(--tk-on-accent)] transition hover:brightness-110"
          >
            Open resource
            <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </Link>
        ) : null}
        <BodyContent post={post} />
        <TagChips tags={getTags(post)} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

/* ------------------------------- PDF (Reference Library) ------------------------------- */
// Rich, document-workspace layout. No decorative photos in the article column.
// The file itself is the visual hero.
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const category = categoryOf(post, 'Reference')
  const pages = getField(post, ['pages', 'pageCount']) || '—'
  const fileSize = getField(post, ['fileSize', 'size']) || '—'
  const format = 'PDF'
  const updated = getField(post, ['updated', 'updatedAt', 'lastUpdated']) || 'Recently'
  const uploadedBy = getField(post, ['uploadedBy', 'author', 'publisher']) || SITE_CONFIG.name
  const filename = getField(post, ['filename', 'fileName']) || `${post.slug || 'reference'}.pdf`
  const sections = (() => {
    const content = getContent(post)
    const raw = Array.isArray(content.sections) ? content.sections : Array.isArray(content.toc) ? content.toc : []
    const cleaned = raw.filter((v): v is string => typeof v === 'string' && !!v.trim())
    if (cleaned.length) return cleaned.slice(0, 6)
    return ['Overview', 'Key findings', 'Recommendations', 'References']
  })()
  const tags = getTags(post)
  const lead = leadText(post)

  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <BackLink task="pdf" />

      {/* Chip row */}
      <EditableReveal>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--tk-accent-soft)] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">
            Reference document
          </span>
          <span className="rounded-full bg-[var(--tk-accent)] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-on-accent)]">
            {format}
          </span>
          <span className="rounded-full bg-[var(--tk-raised)] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-muted)]">
            {category}
          </span>
        </div>
      </EditableReveal>

      {/* Very large display h1 — the typographic centerpiece */}
      <EditableReveal index={1}>
        <h1 className="editable-display mt-8 text-balance text-[3rem] font-medium leading-[1.02] tracking-[-0.035em] sm:text-[5rem] lg:text-[6.5rem]">
          {post.title}
        </h1>
      </EditableReveal>

      {/* Pull-quote lead */}
      {lead ? (
        <EditableReveal index={2}>
          <blockquote className="editable-display mt-10 max-w-4xl border-l-4 border-[var(--tk-accent)] pl-8 text-[1.5rem] font-normal italic leading-[1.4] tracking-[-0.01em] text-[var(--tk-text)] sm:text-[1.875rem]">
            {lead}
          </blockquote>
        </EditableReveal>
      ) : null}

      {/* Primary + secondary CTA */}
      <EditableReveal index={3}>
        <div className="mt-10 flex flex-wrap gap-3">
          {fileUrl ? (
            <>
              <Link
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-[var(--tk-accent)] pl-6 pr-2 py-2 text-sm font-medium text-[var(--tk-on-accent)] transition hover:brightness-110"
              >
                Download PDF
                <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Download className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent-soft)] px-6 py-3 text-sm font-medium text-[var(--tk-accent)] transition hover:brightness-95"
              >
                <ExternalLink className="h-4 w-4" /> Open in new tab
              </Link>
            </>
          ) : (
            <span className="rounded-full bg-[var(--tk-raised)] px-5 py-3 text-sm text-[var(--tk-muted)]">
              Download link pending
            </span>
          )}
        </div>
      </EditableReveal>

      {/* Quick-facts strip */}
      <EditableReveal index={4}>
        <div className="mt-10 grid grid-cols-2 gap-3 rounded-[var(--tk-radius)] bg-[var(--tk-raised)] p-6 sm:grid-cols-4">
          {[
            { label: 'Pages', value: pages },
            { label: 'File size', value: fileSize },
            { label: 'Format', value: format },
            { label: 'Updated', value: updated },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{item.label}</p>
              <p className="editable-display mt-1.5 text-xl font-medium tracking-[-0.02em]">{item.value}</p>
            </div>
          ))}
        </div>
      </EditableReveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          {/* Large embedded PDF preview — the visual centerpiece.
              NOTE: the only `<img>` allowed in the PDF branch is inside the sidebar. */}
          {fileUrl ? (
            <EditableReveal index={5}>
              <div className="overflow-hidden rounded-[var(--tk-radius)] bg-[var(--tk-raised)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] px-6 py-4">
                  <span className="text-sm font-medium">Preview</span>
                  <Link
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-medium text-[var(--tk-on-accent)] transition hover:brightness-110"
                  >
                    Download <Download className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <iframe
                  src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title={post.title}
                  className="h-[82vh] w-full bg-white"
                />
              </div>
            </EditableReveal>
          ) : (
            <div className="flex h-[60vh] items-center justify-center rounded-[var(--tk-radius)] bg-[var(--tk-raised)] text-[var(--tk-muted)]">
              Preview will appear once the file is attached.
            </div>
          )}

          {/* Two-column body */}
          <div className="mt-14">
            <h2 className="editable-display text-[2rem] font-medium tracking-[-0.02em] sm:text-[2.5rem]">
              What&rsquo;s <span className="editable-highlight">inside.</span>
            </h2>
            <div className="mt-8 grid gap-x-10 gap-y-6 lg:grid-cols-2">
              <div>
                <BodyContent post={post} />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Sections</p>
                <ol className="mt-4 grid gap-2.5">
                  {sections.map((s, i) => (
                    <li key={s} className="flex items-start gap-3 rounded-[var(--slot4-radius-sm)] bg-[var(--tk-raised)] p-4 text-sm">
                      <span className="editable-display shrink-0 text-sm font-medium text-[var(--tk-accent)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <TagChips tags={tags} />
          </div>

          {/* Reference-Library detail → article-bottom ad (per spec) */}
          <div className="mt-14">
            <Ads slot="article-bottom" size={pickRandom(getSlotSizes('article-bottom'))} showLabel />
          </div>

          {/* Repeated CTA callout at the bottom of the article */}
          {fileUrl ? (
            <EditableReveal>
              <div className="mt-14 rounded-[var(--tk-radius)] bg-[var(--slot4-dark-bg)] p-10 text-center">
                <h3 className="editable-display text-2xl font-medium tracking-[-0.02em] text-white sm:text-3xl">
                  Save it for <span className="italic text-[var(--tk-accent-soft)]">later.</span>
                </h3>
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/80">
                  Grab the file — the whole reference is a click away.
                </p>
                <Link
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-1 rounded-full bg-white pl-6 pr-2 py-2 text-sm font-medium text-[var(--tk-text)] transition hover:brightness-95"
                >
                  Download PDF
                  <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                    <Download className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </EditableReveal>
          ) : null}
        </article>

        {/* Sticky sidebar — document identity + Download + What's inside */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--tk-radius)] bg-[var(--tk-surface)] p-7 shadow-[0_8px_28px_rgba(0,64,193,0.08)]">
            {/* Large document glyph — rendered in the display face (Instrument Sans) as PDF chars */}
            <div className="flex h-40 items-center justify-center rounded-[var(--slot4-radius-sm)] bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))]">
              <span className="editable-display text-[4rem] font-medium tracking-[-0.04em] text-[var(--tk-accent)]">
                PDF
              </span>
            </div>
            <p className="mt-5 truncate text-sm font-mono text-[var(--tk-muted)]">{filename}</p>
            <div className="mt-5 grid gap-3 text-sm">
              {[
                ['Category', category],
                ['Pages', pages],
                ['File size', fileSize],
                ['Uploaded by', uploadedBy],
                ['Updated', updated],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-[var(--slot4-radius-sm)] bg-[var(--tk-raised)] px-4 py-2.5">
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-muted)]">
                    {label}
                  </span>
                  <span className="truncate text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            {fileUrl ? (
              <Link
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-full bg-[var(--tk-accent)] pl-6 pr-2 py-2.5 text-sm font-medium text-[var(--tk-on-accent)] transition hover:brightness-110"
              >
                Download
                <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Download className="h-4 w-4" />
                </span>
              </Link>
            ) : null}
          </div>

          <div className="rounded-[var(--tk-radius)] bg-[var(--tk-raised)] p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
              What&rsquo;s inside
            </p>
            <ul className="mt-4 grid gap-3 text-sm">
              {sections.map((s) => (
                <li key={s} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <PdfRelatedStrip related={related} />
    </section>
  )
}

/* ------------------------------- Profile ------------------------------- */
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] bg-[var(--tk-surface)] p-9 text-center shadow-[0_8px_28px_rgba(0,64,193,0.08)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))]">
                {images[0] ? (
                  <img src={images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-14 w-14 text-[var(--tk-accent)]" />
                )}
              </div>
              <h1 className="editable-display mt-6 text-2xl font-medium tracking-[-0.02em]">{post.title}</h1>
              {role ? (
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">
                  {role}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                {website ? (
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2 text-sm font-medium text-[var(--tk-on-accent)] transition hover:brightness-110"
                  >
                    Website <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent-soft)] px-5 py-2 text-sm font-medium text-[var(--tk-accent)] transition hover:brightness-95"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <TagChips tags={getTags(post)} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

/* ------------------------------- Related strips ------------------------------- */
function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
      <div className="flex items-end justify-between gap-4">
        <h2 className="editable-display text-2xl font-medium tracking-[-0.02em] sm:text-3xl">
          More {displayLabelFor(task, taskConfig?.label || 'entries').toLowerCase()}
        </h2>
        <Link
          href={taskConfig?.route || '/'}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--tk-accent-soft)] pl-4 pr-1 py-1 text-sm font-medium text-[var(--tk-accent)]"
        >
          View all <ArrowOrb />
        </Link>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((item) => (
          <RelatedCard key={item.id || item.slug} task={task} post={item} />
        ))}
      </div>
    </section>
  )
}

function RelatedCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[var(--tk-radius)] bg-[var(--tk-raised)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,64,193,0.14)]"
    >
      <div className="aspect-[16/10] overflow-hidden bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))]">
        {image ? (
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-7 w-7 text-[var(--tk-accent)]" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="editable-display line-clamp-2 text-base font-medium leading-snug tracking-[-0.02em]">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">
          {stripHtml(summaryText(post))}
        </p>
      </div>
    </Link>
  )
}

// PDF related strip — glyph tiles, NO photography.
function PdfRelatedStrip({ related }: { related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig('pdf')
  return (
    <section className="mt-16">
      <div className="flex items-end justify-between gap-4">
        <h2 className="editable-display text-2xl font-medium tracking-[-0.02em] sm:text-3xl">
          More references
        </h2>
        <Link
          href={taskConfig?.route || '/'}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--tk-accent-soft)] pl-4 pr-1 py-1 text-sm font-medium text-[var(--tk-accent)]"
        >
          View all <ArrowOrb />
        </Link>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((item) => {
          const href = `${getTaskConfig('pdf')?.route || '/pdf'}/${item.slug}`
          const size = getField(item, ['fileSize', 'size']) || 'PDF'
          return (
            <Link
              key={item.id || item.slug}
              href={href}
              className="group block rounded-[var(--tk-radius)] bg-[var(--tk-raised)] p-6 transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,64,193,0.14)]"
            >
              <div className="flex h-32 items-center justify-center rounded-[var(--slot4-radius-sm)] bg-[linear-gradient(180deg,var(--slot4-accent-tint),var(--slot4-accent-soft))]">
                <span className="editable-display text-4xl font-medium tracking-[-0.04em] text-[var(--tk-accent)]">
                  PDF
                </span>
              </div>
              <h3 className="editable-display mt-5 line-clamp-2 text-base font-medium leading-snug tracking-[-0.02em]">
                {item.title}
              </h3>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">
                <Tag className="h-3 w-3" /> {size}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
