'use client'

import { useEffect, useState } from 'react'
import { UploadCloud, MessageSquareText, CalendarCheck, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { listBookings, listClips, listCoachNotes } from '@/lib/store'
import { usePlayers } from '@/lib/players-context'
import { useTranslation } from '@/lib/i18n/context'

type Goal = {
  title: string
  detail: string
  icon: typeof UploadCloud
  progress: number
  done: boolean
}

export function GoalBenchmarks() {
  const { t } = useTranslation()
  const { activePlayer } = usePlayers()
  const [clipCount, setClipCount] = useState(0)
  const [noteCount, setNoteCount] = useState(0)
  const [bookingCount, setBookingCount] = useState(0)

  useEffect(() => {
    if (!activePlayer) return
    listClips(activePlayer.id).then((c) => setClipCount(c.length))
    listCoachNotes(activePlayer.id).then((n) => setNoteCount(n.length))
    listBookings(activePlayer.id).then((b) => setBookingCount(b.filter((x) => x.status === 'booked').length))
  }, [activePlayer?.id])

  const goals: Goal[] = [
    {
      title: t.home.uploadFirstClip,
      detail: t.home.goalDetail(Math.min(clipCount, 1), 1),
      icon: UploadCloud,
      progress: Math.min(clipCount, 1) * 100,
      done: clipCount >= 1,
    },
    {
      title: t.home.getCoachFeedback,
      detail: t.home.goalDetail(Math.min(noteCount, 1), 1),
      icon: MessageSquareText,
      progress: Math.min(noteCount, 1) * 100,
      done: noteCount >= 1,
    },
    {
      title: t.home.bookASession,
      detail: t.home.goalDetail(Math.min(bookingCount, 1), 1),
      icon: CalendarCheck,
      progress: Math.min(bookingCount, 1) * 100,
      done: bookingCount >= 1,
    },
  ]

  return (
    <section className="px-5 pt-8" aria-label="Goal benchmarks">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t.home.gettingStarted}</h2>
        <span className="text-xs font-medium text-muted-foreground">
          {goals.filter((g) => g.done).length} / {goals.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {goals.map((g) => {
          const Icon = g.icon
          return (
            <div
              key={g.title}
              className={cn(
                'rounded-2xl border p-4',
                g.done
                  ? 'border-sage/40 bg-sage/10'
                  : 'border-border bg-card',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    g.done
                      ? 'bg-sage text-sage-foreground'
                      : 'bg-secondary text-primary',
                  )}
                >
                  {g.done ? (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {g.title}
                    </p>
                    <span
                      className={cn(
                        'shrink-0 text-xs font-bold',
                        g.done ? 'text-sage' : 'text-muted-foreground',
                      )}
                    >
                      {g.done ? t.home.goalDone : `${g.progress}%`}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {g.detail}
                  </p>
                </div>
              </div>

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'h-full rounded-full',
                    g.done ? 'bg-sage' : 'bg-primary',
                  )}
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
