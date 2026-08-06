'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Star, BadgeCheck, MessageSquareText, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { coaches, coachById, specializationFilters, type Coach } from '@/lib/coaches'
import { listCoachNotes } from '@/lib/store'
import type { CoachNote } from '@/lib/types'
import { FeedbackHub } from '@/components/coaches/feedback-hub'
import { BookingFlow } from '@/components/coaches/booking-flow'

type View =
  | { name: 'directory' }
  | { name: 'feedback'; clipId: string }
  | { name: 'booking'; coach: Coach }

export function CoachesTab() {
  const [view, setView] = useState<View>({ name: 'directory' })
  const [filter, setFilter] =
    useState<(typeof specializationFilters)[number]>('All')
  const [notes, setNotes] = useState<CoachNote[]>([])

  useEffect(() => {
    listCoachNotes().then(setNotes)
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'All') return coaches
    return coaches.filter((c) =>
      c.specializations.some((s) => s.includes(filter)),
    )
  }, [filter])

  const latestNote = useMemo(
    () =>
      [...notes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0],
    [notes],
  )
  const latestNoteCount = latestNote
    ? notes.filter((n) => n.clipId === latestNote.clipId).length
    : 0

  if (view.name === 'feedback') {
    return (
      <FeedbackHub clipId={view.clipId} onBack={() => setView({ name: 'directory' })} />
    )
  }

  if (view.name === 'booking') {
    return (
      <BookingFlow
        coach={view.coach}
        onBack={() => setView({ name: 'directory' })}
      />
    )
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="px-5 pt-8">
        <h1 className="text-lg font-bold tracking-tight">Coaches</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          1-on-1 sessions & timestamped video feedback
        </p>
      </header>

      {/* Feedback hub entry — only shown once real feedback exists */}
      {latestNote && (
        <div className="mt-4 px-5">
          <button
            type="button"
            onClick={() => setView({ name: 'feedback', clipId: latestNote.clipId })}
            className="flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                New feedback from {coachById(latestNote.coachId)?.name ?? 'your coach'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {latestNoteCount} timestamped note{latestNoteCount === 1 ? '' : 's'} on your clip
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Specialization filters */}
      <div className="mt-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {specializationFilters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
              filter === f
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Coach directory */}
      <div className="mt-4 flex flex-col gap-3 px-5 pb-4">
        <h2 className="text-sm font-bold tracking-tight">
          Pro coaches
          <span className="ml-1.5 font-normal text-muted-foreground">
            {filtered.length}
          </span>
        </h2>

        {filtered.map((coach) => (
          <div
            key={coach.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={coach.avatar}
                  alt={coach.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold">{coach.name}</p>
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {coach.title}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-bronze text-bronze" />
                    <span className="font-bold">{coach.rating}</span>
                    <span className="text-muted-foreground">
                      ({coach.reviews})
                    </span>
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-bold text-primary">
                    ${coach.rate}
                    <span className="font-normal text-muted-foreground">
                      /session
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {coach.bio}
            </p>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {coach.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-md bg-sage/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sage"
                >
                  {b}
                </span>
              ))}
              {coach.specializations.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-foreground"
                >
                  {s}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setView({ name: 'booking', coach })}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
            >
              Book 1-on-1
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
