import { ChevronRight, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sessions } from '@/components/profile/profile-data'

export function ActivityHistory() {
  return (
    <section className="px-5 pb-4 pt-8" aria-label="Session and activity history">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Session & Activity History</h2>
        <button type="button" className="text-xs font-medium text-primary">
          See all
        </button>
      </div>

      <ol className="flex flex-col gap-3">
        {sessions.map((s) => {
          const Icon = s.icon
          const isReport = s.type === 'report'
          return (
            <li key={s.id}>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors duration-200">
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    isReport
                      ? 'bg-sand/40 text-bronze'
                      : 'bg-secondary text-primary',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.coach} · {s.date}
                  </p>
                </div>
                {isReport ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
                    <Download className="h-3 w-3" />
                    PDF
                  </span>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {s.duration}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
