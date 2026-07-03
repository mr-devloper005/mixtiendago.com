import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/login',
    title: 'Sign in',
    description: pagesContent.auth.login.metadataDescription,
  })
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-[calc(100vh-6rem)] bg-[var(--slot4-panel-bg)] text-[var(--slot4-page-text)]">
        <section className={`${container} grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:py-24`}>
          <EditableReveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] shadow-[0_2px_10px_rgba(0,64,193,0.06)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
              {pagesContent.auth.login.badge}
            </span>
            <h1 className="editable-display mt-8 max-w-xl text-balance text-[3rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[4.5rem]">
              {pagesContent.auth.login.title}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[var(--slot4-muted-text)]">
              {pagesContent.auth.login.description}
            </p>
          </EditableReveal>
          <EditableReveal index={1}>
            <div className="rounded-[var(--slot4-radius-md)] bg-[var(--slot4-surface-bg)] p-8 shadow-[0_8px_28px_rgba(0,64,193,0.08)] sm:p-10">
              <h2 className="editable-display text-2xl font-medium tracking-[-0.02em]">
                {pagesContent.auth.login.formTitle}
              </h2>
              <EditableLocalLoginForm />
              <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">
                New here?{' '}
                <Link href="/signup" className="font-medium text-[var(--slot4-accent)] underline-offset-4 hover:underline">
                  {pagesContent.auth.login.createCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
