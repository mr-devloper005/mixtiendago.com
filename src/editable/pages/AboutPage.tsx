import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)]">
        <section className={`${container} py-14 sm:py-20 lg:py-24`}>
          <EditableReveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-surface-bg)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] shadow-[0_2px_10px_rgba(0,64,193,0.06)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
              {pagesContent.about.badge}
            </span>
          </EditableReveal>
          <EditableReveal index={1}>
            <h1 className="editable-display mt-8 text-balance text-[3rem] font-medium leading-[1.02] tracking-[-0.035em] sm:text-[5rem] lg:text-[6.5rem]">
              ABOUT <span className="editable-highlight">{SITE_CONFIG.name}.</span>
            </h1>
          </EditableReveal>
          <EditableReveal index={2}>
            <p className="mt-10 max-w-2xl text-lg leading-8 text-[var(--slot4-muted-text)]">
              {pagesContent.about.description}
            </p>
          </EditableReveal>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="space-y-6 text-[15px] leading-8 text-[var(--slot4-muted-text)]">
              {pagesContent.about.paragraphs.map((paragraph, i) => (
                <EditableReveal key={paragraph} index={i}>
                  <p>{paragraph}</p>
                </EditableReveal>
              ))}
            </article>
            <aside className="grid gap-4">
              {pagesContent.about.values.map((value, i) => (
                <EditableReveal key={value.title} index={i}>
                  <div className="rounded-[var(--slot4-radius-md)] bg-[var(--slot4-panel-bg)] p-7">
                    <h2 className="editable-display text-xl font-medium tracking-[-0.02em]">{value.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                  </div>
                </EditableReveal>
              ))}
            </aside>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
