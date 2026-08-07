'use client'

import { useEffect, useState } from 'react'
import { Bell, ChevronRight, TrendingUp } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import { PlayerAvatar } from '@/components/player-avatar'
import { usePlayers } from '@/lib/players-context'
import { listClips, listCoachNotes } from '@/lib/store'
import { computeOvr } from '@/lib/rating'
import type { Clip, CoachNote } from '@/lib/types'

export function PlayerHeader() {
  const { activePlayer: profile } = usePlayers()
  const [clips, setClips] = useState<Clip[]>([])
  const [notes, setNotes] = useState<CoachNote[]>([])

  useEffect(() => {
    if (!profile) return
    listClips(profile.id).then(setClips)
    listCoachNotes(profile.id).then(setNotes)
  }, [profile?.id])

  if (!profile) return null

  const { ovr, activityLabel } = computeOvr(profile, clips, notes)

  return (
    <header className="px-5 pt-6">
      <LogoMark className="h-6 w-6" />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-primary/30">
            <PlayerAvatar name={profile.name} avatarUrl={profile.avatarUrl} sizePx={44} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Good afternoon,</p>
            <p className="text-sm font-semibold leading-tight">{profile.name}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose ring-2 ring-card" />
        </button>
      </div>

      {/* OVR hero card */}
      <div className="mt-5 overflow-hidden rounded-3xl bg-charcoal text-[color:var(--secondary)]">
        <div className="flex items-stretch">
          {/* FIFA-style rating badge */}
          <div className="flex flex-col items-center justify-center gap-0.5 border-r border-white/10 px-6 py-6">
            <span className="text-5xl font-bold leading-none tracking-tight text-[color:var(--sand)]">
              {ovr}
            </span>
            <span className="text-[11px] font-semibold tracking-[0.2em] text-white/60">
              OVR
            </span>
            <span className="mt-2 rounded-full bg-[color:var(--sage)] px-2.5 py-0.5 text-[10px] font-bold text-[color:var(--sage-foreground)]">
              {profile.position}
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-3 px-5 py-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                Player Rating
              </p>
              <p className="text-sm text-white/80 text-pretty">
                Auto-calculated from {clips.length} upload{clips.length === 1 ? '' : 's'} &amp;{' '}
                {notes.length} coach note{notes.length === 1 ? '' : 's'}.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[color:var(--sand)]">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-semibold">{activityLabel}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-between border-t border-white/10 px-5 py-3 text-xs font-medium text-white/70 transition-colors active:bg-white/5"
        >
          View full player card
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
