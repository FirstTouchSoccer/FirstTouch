'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Play,
  Pause,
  MessageSquare,
  Mic,
  Video as VideoIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getClip, listCoachNotes } from '@/lib/store'
import { coachById } from '@/lib/coaches'
import type { Clip, CoachNote } from '@/lib/types'

const typeMeta = {
  note: { icon: MessageSquare, label: 'Frame note', color: 'text-primary' },
  voice: { icon: Mic, label: 'Voice memo', color: 'text-accent' },
  video: { icon: VideoIcon, label: 'Video response', color: 'text-rose' },
} as const

export function FeedbackHub({
  clipId,
  onBack,
}: {
  clipId: string
  onBack: () => void
}) {
  const [clip, setClip] = useState<Clip | null>(null)
  const [notes, setNotes] = useState<CoachNote[]>([])
  const [activeNote, setActiveNote] = useState<CoachNote | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    getClip(clipId).then(setClip)
    listCoachNotes(clipId).then((n) => {
      setNotes(n)
      setActiveNote(n[0] ?? null)
    })
  }, [clipId])

  if (!clip || !activeNote) {
    return (
      <div className="animate-in fade-in duration-500 px-5 pt-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to coaches"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="mt-6 text-sm text-muted-foreground">
          No coach feedback on this clip yet.
        </p>
      </div>
    )
  }

  const coachName = coachById(activeNote.coachId)?.name ?? 'Your coach'

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center gap-3 px-5 pt-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to coaches"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Feedback Session</h1>
          <p className="text-xs text-muted-foreground">
            {coachName} · {clip.title} review
          </p>
        </div>
      </header>

      {/* Clip with timeline markers */}
      <div className="mt-5 px-5">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-charcoal">
          {clip.thumbnailUrl ? (
            <Image
              src={clip.thumbnailUrl}
              alt={clip.title}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <VideoIcon className="h-10 w-10" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal/30">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause' : 'Play'}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-card/90 text-foreground"
            >
              {playing ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="h-6 w-6 translate-x-0.5 fill-current" />
              )}
            </button>
          </div>
        </div>

        {/* Interactive timeline with markers */}
        <div className="relative mt-4 h-8">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-secondary" />
          <div
            className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-primary"
            style={{ width: `${activeNote.frame}%` }}
          />
          {notes.map((n) => {
            const Icon = typeMeta[n.type].icon
            const isActive = n.id === activeNote.id
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setActiveNote(n)}
                aria-label={`Feedback at frame ${n.frame}`}
                className={cn(
                  'absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-all',
                  isActive
                    ? 'scale-110 border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
                style={{ left: `${n.frame}%` }}
              >
                <Icon className="h-3 w-3" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Notes feed */}
      <div className="mt-6 px-5">
        <h2 className="text-sm font-bold tracking-tight">Coach notes</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Tap a marker or note to jump to that point
        </p>

        <ul className="mt-3 flex flex-col gap-2.5">
          {notes.map((n) => {
            const meta = typeMeta[n.type]
            const Icon = meta.icon
            const isActive = n.id === activeNote.id
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => setActiveNote(n)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors',
                    isActive
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-card',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary',
                      meta.color,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {meta.label}
                      </span>
                      {n.durationSec != null && (
                        <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          0:{String(n.durationSec).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-foreground">
                      {n.text}
                    </p>
                    {(n.type === 'voice' || n.type === 'video') && (
                      <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Play className="h-3 w-3 translate-x-0.5 fill-current" />
                        </span>
                        <div className="flex h-1 flex-1 items-center gap-0.5">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <span
                              key={i}
                              className="w-full rounded-full bg-primary/40"
                              style={{
                                height: `${
                                  4 + Math.abs(Math.sin(i * 0.9)) * 12
                                }px`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
