'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Film, MessageSquareText, ChevronRight } from 'lucide-react'
import { listClips, listCoachNotes } from '@/lib/store'
import { coachById } from '@/lib/coaches'
import { usePlayers } from '@/lib/players-context'
import type { Clip, CoachNote } from '@/lib/types'

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

type FeedItem =
  | { kind: 'clip'; at: string; clip: Clip }
  | { kind: 'note'; at: string; note: CoachNote }

export function ActivityFeed() {
  const { activePlayer } = usePlayers()
  const [clips, setClips] = useState<Clip[]>([])
  const [notes, setNotes] = useState<CoachNote[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!activePlayer) return
    Promise.all([listClips(activePlayer.id), listCoachNotes(activePlayer.id)]).then(([c, n]) => {
      setClips(c)
      setNotes(n)
      setLoaded(true)
    })
  }, [activePlayer?.id])

  const items: FeedItem[] = [
    ...clips.map((clip): FeedItem => ({ kind: 'clip', at: clip.createdAt, clip })),
    ...notes.map((note): FeedItem => ({ kind: 'note', at: note.createdAt, note })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 5)

  return (
    <section className="px-5 pt-8" aria-label="Activity and reviews">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Activity &amp; Reviews</h2>
        <button type="button" className="text-xs font-medium text-primary">
          See all
        </button>
      </div>

      {loaded && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <p className="text-sm font-semibold">No activity yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload a clip in AI Lab to see it show up here.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) =>
          item.kind === 'clip' ? (
            <article
              key={`clip-${item.clip.id}`}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-video w-full bg-secondary">
                {item.clip.thumbnailUrl ? (
                  <Image
                    src={item.clip.thumbnailUrl}
                    alt={item.clip.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 448px) 100vw, 448px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Film className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.clip.title}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(item.clip.createdAt)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {item.clip.status === 'sent_to_coach' ? 'Sent to coach' : 'Uploaded'}
                </span>
              </div>
            </article>
          ) : (
            <article
              key={`note-${item.note.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose/20 text-rose">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {coachById(item.note.coachId)?.name ?? 'Your coach'}
                </p>
                <p className="truncate text-xs text-muted-foreground">{item.note.text}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </article>
          ),
        )}
      </div>
    </section>
  )
}
