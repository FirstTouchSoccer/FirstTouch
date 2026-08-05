import type { Attributes, Clip, CoachNote, PlayerProfile } from '@/lib/types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function average(attrs: Attributes): number {
  const { pace, shooting, dribbling, passing, physicality } = attrs
  return (pace + shooting + dribbling + passing + physicality) / 5
}

function isRecent(iso: string, from: Date): boolean {
  return from.getTime() - new Date(iso).getTime() <= THIRTY_DAYS_MS
}

/**
 * OVR is always computed from real signals, never a bare invented number:
 * base is the mean of the player's attributes, plus a small bounded bonus for
 * verified activity (real, non-sample clips and delivered coach notes).
 */
export function computeOvr(
  profile: PlayerProfile,
  clips: Clip[],
  notes: CoachNote[],
  now: Date = new Date()
): { ovr: number; activityLabel: string } {
  const bonus = Math.min(6, clips.length * 0.5 + notes.length * 1)
  const ovr = Math.max(0, Math.min(99, Math.round(average(profile.attributes) + bonus)))

  const recentClips = clips.filter((c) => isRecent(c.createdAt, now)).length
  const recentNotes = notes.filter((n) => isRecent(n.createdAt, now)).length

  let activityLabel: string
  if (clips.length === 0 && notes.length === 0) {
    activityLabel = 'New here — upload your first clip'
  } else if (recentClips + recentNotes > 0) {
    activityLabel = `Improving — ${recentClips} upload${recentClips === 1 ? '' : 's'} this month`
  } else {
    activityLabel = 'Steady — no new uploads this month'
  }

  return { ovr, activityLabel }
}

/** Consecutive days (ending today) with at least one real activity event. */
export function computeStreak(dates: string[], now: Date = new Date()): number {
  const days = new Set(dates.map((d) => new Date(d).toDateString()))
  let streak = 0
  const cursor = new Date(now)
  while (days.has(cursor.toDateString())) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
