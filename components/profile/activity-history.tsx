'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, MessageSquareText, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { listBookings, listCoachNotes } from '@/lib/store'
import { coachById } from '@/lib/coaches'
import { usePlayers } from '@/lib/players-context'
import { useTranslation } from '@/lib/i18n/context'
import { tf } from '@/lib/i18n/format'
import type { CoachNote, SessionBooking } from '@/lib/types'

type HistoryItem =
  | { kind: 'session'; id: string; at: string; coachName: string; durationMin: number }
  | { kind: 'note'; id: string; at: string; coachName: string; text: string }

export function ActivityHistory() {
  const { activePlayer } = usePlayers()
  const { t, language } = useTranslation()
  const locale = language === 'ru' ? 'ru-RU' : 'en-US'
  const [bookings, setBookings] = useState<SessionBooking[]>([])
  const [notes, setNotes] = useState<CoachNote[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!activePlayer) return
    Promise.all([listBookings(activePlayer.id), listCoachNotes(activePlayer.id)]).then(([b, n]) => {
      setBookings(b)
      setNotes(n)
      setLoaded(true)
    })
  }, [activePlayer?.id])

  const items: HistoryItem[] = [
    ...bookings.map(
      (b): HistoryItem => ({
        kind: 'session',
        id: b.id,
        at: b.startsAt,
        coachName: coachById(b.coachId)?.name ?? t.feedbackHub.yourCoach,
        durationMin: b.durationMin,
      }),
    ),
    ...notes.map(
      (n): HistoryItem => ({
        kind: 'note',
        id: n.id,
        at: n.createdAt,
        coachName: coachById(n.coachId)?.name ?? t.feedbackHub.yourCoach,
        text: n.text,
      }),
    ),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6)

  return (
    <section className="px-5 pb-4 pt-8" aria-label="Session and activity history">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t.activityHistory.title}</h2>
        <button type="button" className="text-xs font-medium text-primary">
          {t.activityHistory.seeAll}
        </button>
      </div>

      {loaded && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card py-8 text-center">
          <p className="text-sm font-medium">{t.activityHistory.noSessions}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.activityHistory.bookOrUpload}
          </p>
        </div>
      )}

      <ol className="flex flex-col gap-3">
        {items.map((item) => {
          const isSession = item.kind === 'session'
          const Icon = isSession ? Target : MessageSquareText
          const dateLabel = new Date(item.at).toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
          })
          return (
            <li key={`${item.kind}-${item.id}`}>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors duration-200">
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    isSession
                      ? 'bg-secondary text-primary'
                      : 'bg-sand/40 text-bronze',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {isSession
                      ? tf(t.activityHistory.oneOnOneWith, { coach: item.coachName })
                      : tf(t.activityHistory.feedbackFrom, { coach: item.coachName })}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {isSession ? dateLabel : `${item.text} · ${dateLabel}`}
                  </p>
                </div>
                {isSession ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.durationMin} {t.activityHistory.min}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ) : (
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {t.activityHistory.feedback}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
