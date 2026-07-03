'use client'

import { Building2, FileText, Image as ImageIcon, Mail, MapPin, Phone, Sparkles, Bookmark } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Building2, title: 'Add a place', body: 'Submit a new directory entry, verify details, and go live.' },
      { icon: Phone, title: 'Partnership support', body: 'Talk through bulk publishing, local growth and operational setup.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Need a new geography or category lane? We can shape the directory around it.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Editorial submissions', body: 'Pitch essays, columns, and long-form ideas that fit the publication.' },
      { icon: Mail, title: 'Newsletter partnerships', body: 'Coordinate sponsorships, collaborations, and issue-level campaigns.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Get help with voice, formatting, and workflow questions.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Creator collaborations', body: 'Discuss gallery launches, creator features and visual campaigns.' },
      { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about usage rights, commercial requests and partnerships.' },
      { icon: Mail, title: 'Media kits', body: 'Request creator decks, editorial support or feature placement.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Library submissions', body: 'Suggest guides, reports and reference material worth adding.' },
    { icon: Mail, title: 'Resource partnerships', body: 'Coordinate curation projects, reference pages, and link programs.' },
    { icon: Sparkles, title: 'Curator support', body: 'Need help organizing shelves, collections, or profile-connected boards?' },
  ]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)]">
        <section className={`${container} py-14 sm:py-20 lg:py-24`}>
          <EditableReveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] shadow-[0_2px_10px_rgba(0,64,193,0.06)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
              {pagesContent.contact.eyebrow}
            </span>
          </EditableReveal>
          <EditableReveal index={1}>
            <h1 className="editable-display mt-8 text-balance text-[2.75rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[4.5rem] lg:text-[6rem]">
              {pagesContent.contact.title.split(' — ')[0] || 'SAY'} <span className="editable-highlight">hello.</span>
            </h1>
          </EditableReveal>
          <EditableReveal index={2}>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--slot4-muted-text)]">
              {pagesContent.contact.description}
            </p>
          </EditableReveal>

          <div className="mt-16 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="grid gap-4">
              {lanes.map((lane, i) => (
                <EditableReveal key={lane.title} index={i}>
                  <div className="rounded-[var(--slot4-radius-md)] bg-[var(--slot4-panel-bg)] p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                      <lane.icon className="h-5 w-5" />
                    </span>
                    <h2 className="editable-display mt-5 text-xl font-medium tracking-[-0.02em]">{lane.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{lane.body}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>

            <EditableReveal index={1}>
              <div className="rounded-[var(--slot4-radius-md)] bg-[var(--slot4-surface-bg)] p-8 shadow-[0_8px_28px_rgba(0,64,193,0.08)]">
                <h2 className="editable-display text-2xl font-medium tracking-[-0.02em]">
                  {pagesContent.contact.formTitle}
                </h2>
                <EditableContactLeadForm />
              </div>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
