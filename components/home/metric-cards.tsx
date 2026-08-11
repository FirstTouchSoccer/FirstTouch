'use client'

import { useEffect, useState } from 'react'
import { Film, MessageSquareText, CalendarClock, Flame, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { listBookings, listClips, listCoachNotes } from '@/lib/store'
import { computeStreak } from '@/lib/rating'
import { usePlayers } from '@/lib/players-context'
import { useTranslation } from '@/lib/i18n/context'
import type { Clip, CoachNote, SessionBooking } from '@/lib/types'

function isThisMonth(iso: string, now: Date): boolean {
  const d = new Date(iso)
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export function MetricCards() {
  const { t } = useTranslation()
  const { activePlayer } = usePlayers()
  const [clips, setClips] = useState<Clip[]>([])
  const [notes, setNotes] = useState<CoachNote[]>([])
  const [bookings, setBookings] = useState<SessionBooking[]>([])

  useEffect(() => {
    if (!activePlayer) return
    listClips(activePlayer.id).then(setClips)
    listCoachNotes(activePlayer.id).then(setNotes)
    listBookings(activePlayer.id).then(setBookings)
  }, [activePlayer?.id])

  const now = new Date()
  const clipsThisMonth = clips.filter((c) => isThisMonth(c.createdAt, now)).length
  const notesThisMonth = notes.filter((n) => isThisMonth(n.createdAt, now)).length
  const upcoming = bookings.filter((b) => b.status === 'booked' && new Date(b.startsAt) > now)
  const streak = computeStreak([...clips.map((c) => c.createdAt), ...notes.map((n) => n.createdAt)])

  const metrics = [
    {
      label: t.home.uploads,
      value: String(clips.length),
      unit: t.home.total,
      delta: t.home.plusThisMonth(clipsThisMonth),
      icon: Film,
      tint: 'text-bronze',
    },
    {
      label: t.home.coachNotes,
      value: String(notes.length),
      unit: t.home.total,
      delta: t.home.plusThisMonth(notesThisMonth),
      icon: MessageSquareText,
      tint: 'text-sage',
    },
    {
      label: t.home.sessions,
      value: String(upcoming.length),
      unit: t.home.booked,
      delta: upcoming.length > 0 ? t.home.onCalendar : t.home.noneBooked,
      icon: CalendarClock,
      tint: 'text-rose',
    },
    {
      label: t.home.dayStreak,
      value: String(streak),
      unit: t.home.days,
      delta: streak >= 3 ? t.home.onFire : streak > 0 ? t.home.keepItUp : t.home.startToday,
      icon: Flame,
      tint: 'text-bronze',
    },
  ]

  return (
    <section className="px-5 pt-6" aria-label="Key metrics">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl bg-secondary',
                    m.tint,
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-sage">
                  <ArrowUpRight className="h-3 w-3" />
                  {m.delta}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight">
                  {m.value}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {m.unit}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.label}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
