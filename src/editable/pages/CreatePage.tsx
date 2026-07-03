'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles, Bookmark } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

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

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: Bookmark,
}

const fieldClass =
  'rounded-full bg-[var(--slot4-accent-soft)] px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:ring-2 focus:ring-[var(--slot4-accent)]/40'
const textareaClass =
  'rounded-[var(--slot4-radius-sm)] bg-[var(--slot4-accent-soft)] px-5 py-4 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:ring-2 focus:ring-[var(--slot4-accent)]/40'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
          <section className={`${container} py-16 sm:py-20 lg:py-24`}>
            <div className="grid gap-8 rounded-[var(--slot4-radius-lg)] bg-[var(--slot4-panel-bg)] p-8 md:grid-cols-[0.9fr_1.1fr] md:p-12">
              <div className="flex h-full min-h-72 items-center justify-center rounded-[var(--slot4-radius-md)] bg-[var(--slot4-dark-bg)] text-white">
                <Lock className="h-20 w-20 opacity-80" />
              </div>
              <div className="self-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] shadow-[0_2px_10px_rgba(0,64,193,0.06)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
                  {pagesContent.create.locked.badge}
                </span>
                <h1 className="editable-display mt-6 text-balance text-[2.5rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[4rem]">
                  {pagesContent.create.locked.title}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-[var(--slot4-muted-text)]">
                  {pagesContent.create.locked.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--slot4-accent-fill)] pl-6 pr-2 py-2 text-sm font-medium text-white transition hover:brightness-110"
                  >
                    Sign in
                    <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-6 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition hover:brightness-95"
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${container} py-14 sm:py-20 lg:py-24`}>
          <div className="grid gap-8 rounded-[var(--slot4-radius-lg)] bg-[var(--slot4-panel-bg)] p-7 lg:grid-cols-[0.85fr_1.15fr] lg:p-12">
            <EditableReveal>
              <aside>
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] shadow-[0_2px_10px_rgba(0,64,193,0.06)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
                  {pagesContent.create.hero.badge}
                </span>
                <h1 className="editable-display mt-6 text-balance text-[2.5rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[3.75rem]">
                  {pagesContent.create.hero.title}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-[var(--slot4-muted-text)]">
                  {pagesContent.create.hero.description}
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {enabledTasks.map((item) => {
                    const Icon = taskIcon[item.key] || FileText
                    const active = item.key === task
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setTask(item.key)}
                        className={`rounded-[var(--slot4-radius-sm)] p-5 text-left transition ${
                          active
                            ? 'bg-[var(--slot4-accent-fill)] text-white'
                            : 'bg-[var(--slot4-surface-bg)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,64,193,0.10)]'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="editable-display mt-3 block text-base font-medium tracking-[-0.01em]">
                          {displayLabelFor(item.key, item.label)}
                        </span>
                        <span className={`mt-1 block text-xs ${active ? 'text-white/80' : 'text-[var(--slot4-muted-text)]'}`}>
                          {item.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </aside>
            </EditableReveal>

            <EditableReveal index={1}>
              <form onSubmit={submit} className="rounded-[var(--slot4-radius-md)] bg-[var(--slot4-surface-bg)] p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-accent)]">
                      Add to {displayLabelFor(activeTask?.key || '', activeTask?.label || 'entry')}
                    </p>
                    <h2 className="editable-display mt-2 text-2xl font-medium tracking-[-0.02em] sm:text-3xl">
                      {pagesContent.create.formTitle}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[var(--slot4-accent-soft)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-accent)]">
                    {session.name}
                  </span>
                </div>

                <div className="mt-6 grid gap-4">
                  <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Entry title" required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                    <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                  </div>
                  <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                  <textarea className={`${textareaClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                  <textarea className={`${textareaClass} min-h-48`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details or description" required />
                </div>

                {created ? (
                  <div className="mt-5 rounded-[var(--slot4-radius-sm)] bg-[var(--slot4-accent-soft)] p-5 text-[var(--slot4-accent)]">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}
                    </p>
                    <p className="mt-1 text-sm">{created.title}</p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-1 rounded-full bg-[var(--slot4-accent-fill)] pl-6 pr-2 text-sm font-medium text-white transition hover:brightness-110"
                >
                  <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
                  <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </button>
              </form>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
