import Link from 'next/link'
import { ArrowUpRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Fresh entries will appear here automatically once this section has published content.',
  actionLabel = 'Back home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('rounded-[var(--slot4-radius-md)] bg-[var(--slot4-panel-bg)] p-10 text-center', className)}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
        <SearchX className="h-6 w-6" />
      </div>
      <h2 className="editable-display mt-6 text-2xl font-medium tracking-[-0.02em]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--slot4-muted-text)]">{description}</p>
      <Link
        href={actionHref}
        className="mt-6 inline-flex items-center gap-1 rounded-full bg-[var(--slot4-accent-fill)] pl-5 pr-1.5 py-1.5 text-sm font-medium text-white transition hover:brightness-110"
      >
        {actionLabel}
        <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'entries', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`Published ${taskLabel} from the panel will appear here automatically. The layout stays ready even when the feed is empty.`}
      actionLabel="Explore the site"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for reaching out. Your request has been saved and routed through the contact workflow."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}
