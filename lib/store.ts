'use client'

import { supabase, supabaseConfigured } from '@/lib/supabase'
import { getVideo, putVideo } from '@/lib/idb'
import type {
  Clip,
  CoachNote,
  PlayerProfile,
  Session,
  SessionBooking,
  SkillTag,
} from '@/lib/types'
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  seedDemoBookings,
  seedDemoClips,
  seedDemoCoachNotes,
  seedDemoProfile,
} from '@/lib/demo-data'

export const isDemoMode = !supabaseConfigured

const SESSION_KEY = 'ft_session'
const profileKey = (userId: string) => `ft_profile:${userId}`
const clipsKey = (userId: string) => `ft_clips:${userId}`
const notesKey = (userId: string) => `ft_notes:${userId}`
const bookingsKey = (userId: string) => `ft_bookings:${userId}`

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function mapAuthError(message: string): string {
  if (message.toLowerCase().includes('email not confirmed')) {
    return 'Check your inbox and confirm your email before signing in.'
  }
  return message
}

function defaultProfile(userId: string, email: string, name: string): PlayerProfile {
  return {
    id: userId,
    email,
    name,
    avatarUrl: '/player-avatar.png',
    position: 'CAM',
    age: null,
    location: '',
    attributes: { pace: 60, shooting: 60, dribbling: 60, passing: 60, physicality: 60 },
    createdAt: new Date().toISOString(),
  }
}

// ---------- Auth ----------

export async function getSession(): Promise<Session | null> {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    const s = data.session
    return s ? { userId: s.user.id, email: s.user.email ?? '' } : null
  }
  return readJson<Session>(SESSION_KEY)
}

async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) throw new Error('Not signed in.')
  return session
}

export type SignUpResult =
  | { status: 'signed_in'; session: Session }
  | { status: 'verification_required'; email: string }

export async function signUp(email: string, password: string, name: string): Promise<SignUpResult> {
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw new Error(mapAuthError(error.message))
    const user = data.user
    if (!user) throw new Error('Sign-up succeeded but no user returned.')
    if (!data.session) return { status: 'verification_required', email }
    await supabase.from('profiles').upsert(profileToRow(defaultProfile(user.id, email, name)))
    return { status: 'signed_in', session: { userId: user.id, email } }
  }
  // Demo mode: any email/password works, no real inbox, nothing to verify.
  const session: Session = { userId: `demo-${email.toLowerCase()}`, email }
  writeJson(SESSION_KEY, session)
  if (!readJson<PlayerProfile>(profileKey(session.userId))) {
    writeJson(profileKey(session.userId), defaultProfile(session.userId, email, name))
    writeJson(clipsKey(session.userId), [])
    writeJson(notesKey(session.userId), [])
    writeJson(bookingsKey(session.userId), [])
  }
  return { status: 'signed_in', session }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  if (!supabase) return
  await supabase.auth.resend({ type: 'signup', email })
}

export async function signIn(email: string, password: string): Promise<Session> {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(mapAuthError(error.message))
    return { userId: data.user.id, email }
  }
  // Demo mode: signing in with an email that has no local profile yet
  // silently registers it — any credentials always work.
  const session: Session = { userId: `demo-${email.toLowerCase()}`, email }
  writeJson(SESSION_KEY, session)
  if (!readJson<PlayerProfile>(profileKey(session.userId))) {
    await signUp(email, password, email.split('@')[0])
  }
  return session
}

/**
 * The login screen's "Continue with demo account" button. Always the same
 * seeded identity so the pitch demo shows a populated history, not an empty
 * new account.
 */
export async function signInWithDemoAccount(): Promise<Session> {
  if (supabase) {
    try {
      return await signIn(DEMO_EMAIL, DEMO_PASSWORD)
    } catch {
      const result = await signUp(DEMO_EMAIL, DEMO_PASSWORD, 'Diego Marín')
      if (result.status === 'signed_in') return result.session
      throw new Error('The demo account needs email verification on this Supabase project.')
    }
  }
  const session: Session = { userId: `demo-${DEMO_EMAIL.toLowerCase()}`, email: DEMO_EMAIL }
  writeJson(SESSION_KEY, session)
  if (!readJson<PlayerProfile>(profileKey(session.userId))) {
    writeJson(profileKey(session.userId), seedDemoProfile(session.userId))
    writeJson(clipsKey(session.userId), seedDemoClips(session.userId))
    writeJson(notesKey(session.userId), seedDemoCoachNotes(session.userId))
    writeJson(bookingsKey(session.userId), seedDemoBookings(session.userId))
  }
  return session
}

export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut()
    return
  }
  if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY)
}

// ---------- Profile ----------

export async function getProfile(): Promise<PlayerProfile | null> {
  const session = await getSession()
  if (!session) return null
  if (supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.userId)
      .single()
    if (!data) {
      const { data: userData } = await supabase.auth.getUser()
      const name = (userData.user?.user_metadata as { name?: string } | undefined)?.name ?? ''
      const fresh = defaultProfile(session.userId, session.email, name)
      await supabase.from('profiles').upsert(profileToRow(fresh))
      return fresh
    }
    return rowToProfile(data, session.email)
  }
  return readJson<PlayerProfile>(profileKey(session.userId))
}

export async function saveProfile(patch: Partial<PlayerProfile>): Promise<PlayerProfile> {
  const session = await requireSession()
  const current = await getProfile()
  const merged: PlayerProfile = { ...(current ?? defaultProfile(session.userId, session.email, '')), ...patch }
  if (supabase) {
    await supabase.from('profiles').upsert(profileToRow(merged))
    const refreshed = await getProfile()
    if (!refreshed) throw new Error('Profile save failed.')
    return refreshed
  }
  writeJson(profileKey(session.userId), merged)
  return merged
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function profileToRow(p: PlayerProfile) {
  return {
    id: p.id,
    name: p.name,
    avatar_url: p.avatarUrl,
    position: p.position,
    age: p.age,
    location: p.location,
    pace: p.attributes.pace,
    shooting: p.attributes.shooting,
    dribbling: p.attributes.dribbling,
    passing: p.attributes.passing,
    physicality: p.attributes.physicality,
  }
}

function rowToProfile(row: any, email: string): PlayerProfile {
  return {
    id: row.id,
    email,
    name: row.name,
    avatarUrl: row.avatar_url,
    position: row.position,
    age: row.age,
    location: row.location,
    attributes: {
      pace: row.pace,
      shooting: row.shooting,
      dribbling: row.dribbling,
      passing: row.passing,
      physicality: row.physicality,
    },
    createdAt: row.created_at,
  }
}

// ---------- Clips ----------

export async function listClips(): Promise<Clip[]> {
  const session = await getSession()
  if (!session) return []
  if (supabase) {
    const { data } = await supabase
      .from('clips')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
    return (data ?? []).map(rowToClip)
  }
  const clips = readJson<Clip[]>(clipsKey(session.userId)) ?? []
  return [...clips].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getClip(id: string): Promise<Clip | null> {
  const clips = await listClips()
  return clips.find((c) => c.id === id) ?? null
}

export async function createClip(title: string, file: File, skillTag: SkillTag): Promise<Clip> {
  const session = await requireSession()
  const id = newId()
  if (supabase) {
    const path = `${session.userId}/${id}-${file.name}`
    await supabase.storage.from('videos').upload(path, file)
    await supabase.from('clips').insert({
      id,
      user_id: session.userId,
      title,
      skill_tag: skillTag,
      video_path: path,
      status: 'uploaded',
    })
    return {
      id,
      title,
      skillTag,
      videoKey: path,
      isSample: false,
      status: 'uploaded',
      createdAt: new Date().toISOString(),
    }
  }
  const videoKey = `video-${id}`
  await putVideo(videoKey, file)
  const clip: Clip = {
    id,
    title,
    skillTag,
    videoKey,
    isSample: false,
    status: 'uploaded',
    createdAt: new Date().toISOString(),
  }
  const clips = readJson<Clip[]>(clipsKey(session.userId)) ?? []
  writeJson(clipsKey(session.userId), [clip, ...clips])
  return clip
}

export async function updateClip(id: string, patch: Partial<Pick<Clip, 'status'>>): Promise<void> {
  const session = await requireSession()
  if (supabase) {
    await supabase.from('clips').update(patch).eq('id', id).eq('user_id', session.userId)
    return
  }
  const clips = readJson<Clip[]>(clipsKey(session.userId)) ?? []
  writeJson(clipsKey(session.userId), clips.map((c) => (c.id === id ? { ...c, ...patch } : c)))
}

export async function resolveVideoUrl(clip: Clip): Promise<string | null> {
  if (clip.isSample || !clip.videoKey) return null
  if (supabase) {
    const { data } = await supabase.storage.from('videos').createSignedUrl(clip.videoKey, 60 * 60)
    return data?.signedUrl ?? null
  }
  const blob = await getVideo(clip.videoKey)
  return blob ? URL.createObjectURL(blob) : null
}

function rowToClip(row: any): Clip {
  return {
    id: row.id,
    title: row.title,
    skillTag: row.skill_tag,
    videoKey: row.video_path,
    isSample: row.is_sample,
    status: row.status,
    createdAt: row.created_at,
  }
}

// ---------- Coach notes ----------

export async function listCoachNotes(clipId?: string): Promise<CoachNote[]> {
  const session = await getSession()
  if (!session) return []
  if (supabase) {
    let query = supabase.from('coach_notes').select('*').eq('user_id', session.userId)
    if (clipId) query = query.eq('clip_id', clipId)
    const { data } = await query.order('frame', { ascending: true })
    return (data ?? []).map(rowToNote)
  }
  const notes = readJson<CoachNote[]>(notesKey(session.userId)) ?? []
  const filtered = clipId ? notes.filter((n) => n.clipId === clipId) : notes
  return [...filtered].sort((a, b) => a.frame - b.frame)
}

export async function createCoachNote(
  note: Omit<CoachNote, 'id' | 'isSample' | 'createdAt'>
): Promise<CoachNote> {
  const session = await requireSession()
  const full: CoachNote = { ...note, id: newId(), isSample: false, createdAt: new Date().toISOString() }
  if (supabase) {
    await supabase.from('coach_notes').insert(noteToRow(full, session.userId))
    return full
  }
  const notes = readJson<CoachNote[]>(notesKey(session.userId)) ?? []
  writeJson(notesKey(session.userId), [full, ...notes])
  return full
}

function rowToNote(row: any): CoachNote {
  return {
    id: row.id,
    clipId: row.clip_id,
    coachId: row.coach_id,
    frame: row.frame,
    type: row.type,
    text: row.text,
    durationSec: row.duration_sec,
    isSample: row.is_sample,
    createdAt: row.created_at,
  }
}

function noteToRow(n: CoachNote, userId: string) {
  return {
    id: n.id,
    user_id: userId,
    clip_id: n.clipId,
    coach_id: n.coachId,
    frame: n.frame,
    type: n.type,
    text: n.text,
    media_path: null,
    duration_sec: n.durationSec,
  }
}

// ---------- Bookings ----------

export async function listBookings(): Promise<SessionBooking[]> {
  const session = await getSession()
  if (!session) return []
  if (supabase) {
    const { data } = await supabase
      .from('session_bookings')
      .select('*')
      .eq('user_id', session.userId)
      .order('starts_at', { ascending: true })
    return (data ?? []).map(rowToBooking)
  }
  const bookings = readJson<SessionBooking[]>(bookingsKey(session.userId)) ?? []
  return [...bookings].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
}

export async function createBooking(
  booking: Omit<SessionBooking, 'id' | 'status' | 'createdAt'>
): Promise<SessionBooking> {
  const session = await requireSession()
  const full: SessionBooking = { ...booking, id: newId(), status: 'booked', createdAt: new Date().toISOString() }
  if (supabase) {
    await supabase.from('session_bookings').insert(bookingToRow(full, session.userId))
    return full
  }
  const bookings = readJson<SessionBooking[]>(bookingsKey(session.userId)) ?? []
  writeJson(bookingsKey(session.userId), [full, ...bookings])
  return full
}

export async function cancelBooking(id: string): Promise<void> {
  const session = await requireSession()
  if (supabase) {
    await supabase.from('session_bookings').update({ status: 'cancelled' }).eq('id', id).eq('user_id', session.userId)
    return
  }
  const bookings = readJson<SessionBooking[]>(bookingsKey(session.userId)) ?? []
  writeJson(
    bookingsKey(session.userId),
    bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
  )
}

function rowToBooking(row: any): SessionBooking {
  return {
    id: row.id,
    coachId: row.coach_id,
    startsAt: row.starts_at,
    durationMin: row.duration_min,
    focus: row.focus,
    level: row.level,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  }
}

function bookingToRow(b: SessionBooking, userId: string) {
  return {
    id: b.id,
    user_id: userId,
    coach_id: b.coachId,
    starts_at: b.startsAt,
    duration_min: b.durationMin,
    focus: b.focus,
    level: b.level,
    notes: b.notes,
    status: b.status,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
