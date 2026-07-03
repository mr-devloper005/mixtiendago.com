'use client'

import Link from 'next/link'
import { ArrowUpRight, Facebook, Twitter, Instagram, Dribbble, Mail, MapPin } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

// Display-label rename map (keys unchanged, only user-visible strings change).
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



export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="mt-[3.75rem] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      {/* CTA band — Arooth "PROJECT IN MIND?" pattern reframed for the platform */}
      <section className="mx-auto w-full max-w-[var(--editable-container)] px-5 pt-[5rem] pb-[3.75rem] sm:px-8 lg:px-12">
        <div className="flex flex-col items-center gap-8 text-center">
          <p className="editable-display text-balance text-[2.5rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[4.5rem] lg:text-[6rem]">
            SOMETHING TO <span className="editable-highlight">SHARE?</span>
          </p>
          <div className="grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            
          </div>
        </div>
      </section>

      {/* Multi-column footer */}
      <div className="mx-auto grid w-full max-w-[var(--editable-container)] gap-10 px-5 pb-10 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
            <span className="editable-display text-2xl font-medium tracking-[-0.01em]">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-[var(--slot4-muted-text)]">
            {globalContent.footer?.description ||
              `${SITE_CONFIG.name} pairs a local directory with a reference library — trusted places, useful guides, and downloadable material, kept in one calm home.`}
          </p>
          <form action="/search" className="mt-6 flex items-center gap-2 rounded-full bg-[var(--slot4-surface-bg)] pl-5 pr-2 py-2 shadow-[0_4px_18px_rgba(0,64,193,0.06)]">
            <input
              name="q"
              type="search"
              placeholder=""
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--slot4-accent-fill)] text-[var(--slot4-on-accent)] transition hover:brightness-110"
              aria-label="Send"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div>
          <h3 className="editable-display text-lg font-medium tracking-[-0.01em]">Discover</h3>
          <div className="mt-4 grid gap-2.5">
            {taskLinks.map((task) => (
              <Link
                key={task.key}
                href={task.route}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]"
              >
                {displayLabelFor(task.key, task.label)}
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="editable-display text-lg font-medium tracking-[-0.01em]">Resources</h3>
          <div className="mt-4 grid gap-2.5">
            {[
              ['About', '/about'],
              ['Contact', '/contact'],
              ['Search', '/search'],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]">
                {label}
              </Link>
            ))}
          </div>

          <h3 className="editable-display mt-8 text-lg font-medium tracking-[-0.01em]">Account</h3>
          <div className="mt-4 grid gap-2.5">
            {session ? (
              <>
                <Link href="/create" className="text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]">Create</Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-left text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]">Sign in</Link>
                <Link href="/signup" className="text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]">Get started</Link>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="editable-display text-lg font-medium tracking-[-0.01em]">Reach us</h3>
          <div className="mt-4 grid gap-3 text-sm text-[var(--slot4-muted-text)]">
            <p className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
              <span>{SITE_CONFIG.domain || SITE_CONFIG.name}</span>
            </p>
           
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--editable-border)]">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-[var(--slot4-muted-text)] sm:flex-row sm:px-8 lg:px-12">
          <p>© {year} {SITE_CONFIG.name}. All rights reserved.</p>
          <p>{globalContent.footer?.bottomNote || 'A calmer home for local discovery and useful references.'}</p>
        </div>
      </div>
    </footer>
  )
}
