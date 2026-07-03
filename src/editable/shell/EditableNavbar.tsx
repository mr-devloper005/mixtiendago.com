'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, ArrowUpRight, LogIn, UserPlus, PlusCircle, LogOut } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const staticLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent pt-4 sm:pt-6">
      <div className="mx-auto flex w-full max-w-[var(--editable-container)] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Central pill nav — Arooth signature */}
        <div className="flex flex-1 items-center justify-between gap-2 rounded-full bg-[var(--slot4-surface-bg)] py-2 pl-3 pr-2 shadow-[0_8px_28px_rgba(0,64,193,0.10)] backdrop-blur-md sm:py-2.5 sm:pl-4 sm:pr-3">
          <Link href="/" className="group flex shrink-0 items-center gap-2 rounded-full px-2 py-1">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-7 w-7 object-contain" />
            <span className="editable-display max-w-[180px] truncate text-lg font-medium tracking-[-0.01em] sm:text-xl">
              {SITE_CONFIG.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {staticLinks.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-5 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                      : 'text-[var(--slot4-page-text)] hover:bg-[var(--slot4-accent-soft)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/search"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-accent-soft)] hover:text-[var(--slot4-accent)]"
            >
              <Search className="h-4 w-4" />
            </Link>
            {session ? (
              <>
                <Link
                  href="/create"
                  className="hidden items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] pl-4 pr-1.5 py-1.5 text-sm font-medium text-[var(--slot4-on-accent)] transition hover:brightness-110 sm:inline-flex"
                >
                  Create
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <PlusCircle className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-[var(--slot4-muted-text)] transition hover:bg-[var(--slot4-accent-soft)] hover:text-[var(--slot4-accent)] sm:inline-flex"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden h-9 items-center rounded-full px-4 text-sm font-medium text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-accent-soft)] sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="hidden items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] pl-4 pr-1.5 py-1.5 text-sm font-medium text-[var(--slot4-on-accent)] transition hover:brightness-110 sm:inline-flex"
                >
                  Get started
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-accent-soft)] lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="mx-auto mt-3 w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8 lg:hidden">
          <div className="rounded-[var(--slot4-radius-md)] bg-[var(--slot4-surface-bg)] p-5 shadow-[0_8px_28px_rgba(0,64,193,0.10)]">
            <form action="/search" className="mb-5 flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-4 py-2.5">
              <Search className="h-4 w-4 text-[var(--slot4-accent)]" />
              <input
                name="q"
                type="search"
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]"
              />
            </form>
            <div className="grid gap-1">
              {[
                ...staticLinks,
                ...(session
                  ? [{ label: 'Create', href: '/create' }]
                  : [
                      { label: 'Sign in', href: '/login' },
                      { label: 'Get started', href: '/signup' },
                    ]),
              ].map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-full px-4 py-3 text-sm font-medium transition ${
                      active
                        ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                        : 'text-[var(--slot4-page-text)] hover:bg-[var(--slot4-accent-soft)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
              {session ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                  className="mt-1 rounded-full bg-[var(--slot4-accent-soft)] px-4 py-3 text-left text-sm font-medium text-[var(--slot4-accent)]"
                >
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

// Kept exported for compatibility with any earlier import; icons unused now.
export { LogIn, UserPlus }
