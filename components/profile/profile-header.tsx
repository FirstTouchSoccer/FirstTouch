'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, Camera, Loader2, MapPin, LogOut, Film, MessageSquareText, Trophy, Flame } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { PlayerAvatar } from '@/components/player-avatar'
import { usePlayers } from '@/lib/players-context'
import { listBookings, listClips, listCoachNotes, signOut, updatePlayer } from '@/lib/store'
import { fileToAvatarDataUrl } from '@/lib/image-resize'
import { computeOvr, computeStreak } from '@/lib/rating'
import { useTranslation } from '@/lib/i18n/context'
import { tf } from '@/lib/i18n/format'
import type { Clip, CoachNote, SessionBooking } from '@/lib/types'

export function ProfileHeader() {
  const router = useRouter()
  const { t } = useTranslation()
  const { activePlayer: profile, refreshPlayers } = usePlayers()
  const [clips, setClips] = useState<Clip[]>([])
  const [notes, setNotes] = useState<CoachNote[]>([])
  const [bookings, setBookings] = useState<SessionBooking[]>([])
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !profile) return
    setAvatarError(null)
    setAvatarUploading(true)
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      await updatePlayer(profile.id, { avatarUrl: dataUrl })
      await refreshPlayers()
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : t.profile.couldNotUpdatePhoto)
    } finally {
      setAvatarUploading(false)
    }
  }

  const stats = [
    { label: t.profile.uploads, value: String(clips.length), icon: Film },
    { label: t.profile.coachNotes, value: String(notes.length), icon: MessageSquareText },
    { label: t.profile.sessions, value: String(sessionCount), icon: Trophy },
    { label: t.profile.dayStreak, value: String(streak), icon: Flame },
  ]

  return (
    <header className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">{t.profile.title}</h1>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            aria-label={t.home.signOut}
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
          <div className="relative shrink-0">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-border">
              <PlayerAvatar name={profile.name} avatarUrl={profile.avatarUrl} sizePx={80} />
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-charcoal/50">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label={t.profile.changePhoto}
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground disabled:opacity-60"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
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
                {ovr} {t.home.ovr}
              </span>
              {profile.age != null && (
                <span className="text-[11px] font-medium text-muted-foreground">
                  {tf(t.profile.ageLabel, { age: profile.age })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {avatarError && <p className="mt-1.5 text-xs font-medium text-destructive">{avatarError}</p>}

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
