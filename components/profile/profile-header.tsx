'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, MapPin, LogOut, Film, MessageSquareText, Trophy, Flame } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { PlayerAvatar } from '@/components/player-avatar'
import { usePlayers } from '@/lib/players-context'
import { listBookings, listClips, listCoachNotes, signOut } from '@/lib/store'
import { computeOvr, computeStreak } from '@/lib/rating'
import type { Clip, CoachNote, SessionBooking } from '@/lib/types'

export function ProfileHeader() {
  const router = useRouter()
  const { activePlayer: profile } = usePlayers()
  const [clips, setClips] = useState<Clip[]>([])
  const [notes, setNotes] = useState<CoachNote[]>([])
  const [bookings, setBookings] = useState<SessionBooking[]>([])

  useEffect(() => {
    if (!profile) return
    listClips(profile.id).then(setClips)
    listCoachNotes(profile.id).then(setNotes)
    listBookings(profile.id).then(setBookings)
  }, [profile?.id])

  if (!profile) return null

  const { ovr } = computeOvr(profile, clips, notes)
  const streak = computeStreak([...clips.map((c) => c.createdAt), ...notes.map((n) => n.createdAt)])
  const sessionCount = bookings.filter((b) => b.status === 'booked').length

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const stats = [
    { label: 'Uploads', value: String(clips.length), icon: Film },
    { label: 'Coach Notes', value: String(notes.length), icon: MessageSquareText },
    { label: 'Sessions', value: String(sessionCount), icon: Trophy },
    { label: 'Day Streak', value: String(streak), icon: Flame },
  ]

  return (
    <header className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Profile</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Sign out"
            onClick={handleSignOut}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors duration-200"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Player card */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card transition-colors duration-200">
        <div className="flex items-center gap-4 p-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-border">
            <PlayerAvatar name={profile.name} avatarUrl={profile.avatarUrl} sizePx={80} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-lg font-bold text-black dark:text-[color:var(--sand)]">
                {profile.name}
              </p>
              <BadgeCheck className="h-4 w-4 shrink-0 text-[color:var(--sand)]" />
            </div>
            {profile.location && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-[color:var(--sage)] px-2.5 py-0.5 text-[10px] font-bold text-[color:var(--sage-foreground)]">
                {profile.position}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-[color:var(--sand)]">
                {ovr} OVR
              </span>
              {profile.age != null && (
                <span className="text-[11px] font-medium text-muted-foreground">
                  Age {profile.age}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* activity stat chips */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card py-3 transition-colors duration-200"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-base font-bold leading-none">{s.value}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </header>
  )
}
