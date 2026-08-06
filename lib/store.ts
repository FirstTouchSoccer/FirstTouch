'use client'

import { supabase, supabaseConfigured } from '@/lib/supabase'
import { getVideo, putVideo } from '@/lib/idb'
import type {
  Clip,
  CoachNote,
  ExperienceLevel,
  Player,
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
  seedDemoPlayer,
} from '@/lib/demo-data'

export const isDemoMode = !supabaseConfigured

const SESSION_KEY = 'ft_session'
const playersKey = (userId: string) => `ft_players:${userId}`
const clipsKey = (userId: string, playerId: string) => `ft_clips:${userId}:${playerId}`
const notesKey = (userId: string, playerId: string) => `ft_notes:${userId}:${playerId}`
const bookingsKey = (userId: string, playerId: string) => `ft_bookings:${userId}:${playerId}`

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

/** Access token for the current Supabase session, to authorize R2 storage routes. */
async function authToken(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
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

function buildPlayer(
  id: string,
  accountId: string,
  name: string,
  age: number | null,
  experience: ExperienceLevel,
  consentedAt: string
): Player {
  return {
    id,
    accountId,
    name,
    avatarUrl: '/player-avatar.png',
    position: 'CAM',
    age,
    experience,
    location: '',
    attributes: { pace: 60, shooting: 60, dribbling: 60, passing: 60, physicality: 60 },
    consentedAt,
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

/**
 * `accountName` is the signing-up adult (parent/guardian, or the player
 * themselves if 18+) — stored in Supabase auth user_metadata only, no UI
 * surfaces it yet, kept for support/correspondence use later. `playerName`/
 * `age`/`experience`/`consentedAt` describe the first child added at signup;
 * consent is captured per-player (not once for the whole account), since a
 * blanket consent at signup is weak evidence for a second child added later.
 */
export async function signUp(
  email: string,
  password: string,
  accountName: string,
  playerName: string,
  age: number | null,
  experience: ExperienceLevel,
  consentedAt: string
): Promise<SignUpResult> {
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_name: accountName,
          player_name: playerName,
          player_age: age,
          player_experience: experience,
          consented_at: consentedAt,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw new Error(mapAuthError(error.message))
    const user = data.user
    if (!user) throw new Error('Sign-up succeeded but no user returned.')
    if (!data.session) return { status: 'verification_required', email }
    const player = buildPlayer(newId(), user.id, playerName, age, experience, consentedAt)
    await supabase.from('players').insert(playerToRow(player))
    return { status: 'signed_in', session: { userId: user.id, email } }
  }
  // Demo mode: any email/password works, no real inbox, nothing to verify.
  const session: Session = { userId: `demo-${email.toLowerCase()}`, email }
  writeJson(SESSION_KEY, session)
  if (!readJson<Player[]>(playersKey(session.userId))) {
    const player = buildPlayer(newId(), session.userId, playerName, age, experience, consentedAt)
    writeJson(playersKey(session.userId), [player])
    writeJson(clipsKey(session.userId, player.id), [])
    writeJson(notesKey(session.userId, player.id), [])
    writeJson(bookingsKey(session.userId, player.id), [])
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
  // Demo mode: signing in with an email that has no local players yet
  // silently registers it — any credentials always work.
  const session: Session = { userId: `demo-${email.toLowerCase()}`, email }
  writeJson(SESSION_KEY, session)
  if (!readJson<Player[]>(playersKey(session.userId))) {
    const guessName = email.split('@')[0]
    await signUp(email, password, guessName, guessName, null, 'developing', new Date().toISOString())
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
      const result = await signUp(
        DEMO_EMAIL,
        DEMO_PASSWORD,
        'Demo Parent',
        'Diego Marín',
        17,
        'club',
        new Date().toISOString()
      )
      if (result.status === 'signed_in') return result.session
      throw new Error('The demo account needs email verification on this Supabase project.')
    }
  }
  const session: Session = { userId: `demo-${DEMO_EMAIL.toLowerCase()}`, email: DEMO_EMAIL }
  writeJson(SESSION_KEY, session)
  if (!readJson<Player[]>(playersKey(session.userId))) {
    const player = seedDemoPlayer(session.userId)
    writeJson(playersKey(session.userId), [player])
    writeJson(clipsKey(session.userId, player.id), seedDemoClips(player.id))
    writeJson(notesKey(session.userId, player.id), seedDemoCoachNotes(player.id))
    writeJson(bookingsKey(session.userId, player.id), seedDemoBookings(player.id))
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

// ---------- Players ----------

export async function listPlayers(): Promise<Player[]> {
  const session = await getSession()
  if (!session) return []
  if (supabase) {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('account_id', session.userId)
      .order('created_at', { ascending: true })
    if (data && data.length > 0) return data.map(rowToPlayer)

    // Signup created the auth user + metadata but the player row itself
    // hadn't been written yet (e.g. email verification was pending) —
    // recover it now, same deferred-creation pattern the old single-profile
    // getProfile() used.
    const { data: userData } = await supabase.auth.getUser()
    const meta = userData.user?.user_metadata as
      | { player_name?: string; player_age?: number | null; player_experience?: ExperienceLevel; consented_at?: string }
      | undefined
    if (meta?.player_name && meta?.consented_at) {
      const player = await createPlayer({
        name: meta.player_name,
        age: meta.player_age ?? null,
        experience: meta.player_experience ?? 'developing',
        consentedAt: meta.consented_at,
      })
      return [player]
    }
    return []
  }
  return readJson<Player[]>(playersKey(session.userId)) ?? []
}

export async function getPlayer(id: string): Promise<Player | null> {
  const players = await listPlayers()
  return players.find((p) => p.id === id) ?? null
}

export async function createPlayer(input: {
  name: string
  age: number | null
  experience: ExperienceLevel
  consentedAt: string
}): Promise<Player> {
  const session = await requireSession()
  const player = buildPlayer(newId(), session.userId, input.name, input.age, input.experience, input.consentedAt)
  if (supabase) {
    await supabase.from('players').insert(playerToRow(player))
    return player
  }
  const players = readJson<Player[]>(playersKey(session.userId)) ?? []
  writeJson(playersKey(session.userId), [...players, player])
  writeJson(clipsKey(session.userId, player.id), [])
  writeJson(notesKey(session.userId, player.id), [])
  writeJson(bookingsKey(session.userId, player.id), [])
  return player
}

export async function updatePlayer(
  id: string,
  patch: Partial<Pick<Player, 'name' | 'avatarUrl' | 'position' | 'age' | 'experience' | 'location' | 'attributes'>>
): Promise<Player> {
  const session = await requireSession()
  const current = await getPlayer(id)
  if (!current) throw new Error('Player not found.')
  const merged: Player = { ...current, ...patch }
  if (supabase) {
    await supabase.from('players').update(playerToRow(merged)).eq('id', id)
    return merged
  }
  const players = readJson<Player[]>(playersKey(session.userId)) ?? []
  writeJson(playersKey(session.userId), players.map((p) => (p.id === id ? merged : p)))
  return merged
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function playerToRow(p: Player) {
  return {
    id: p.id,
    account_id: p.accountId,
    name: p.name,
    avatar_url: p.avatarUrl,
    position: p.position,
    age: p.age,
    experience: p.experience,
    location: p.location,
    pace: p.attributes.pace,
    shooting: p.attributes.shooting,
    dribbling: p.attributes.dribbling,
    passing: p.attributes.passing,
    physicality: p.attributes.physicality,
    consented_at: p.consentedAt,
  }
}

function rowToPlayer(row: any): Player {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    avatarUrl: row.avatar_url,
    position: row.position,
    age: row.age,
    experience: row.experience ?? 'developing',
    location: row.location,
    attributes: {
      pace: row.pace,
      shooting: row.shooting,
      dribbling: row.dribbling,
      passing: row.passing,
      physicality: row.physicality,
    },
    consentedAt: row.consented_at,
    createdAt: row.created_at,
  }
}

// ---------- Clips ----------

export async function listClips(playerId: string): Promise<Clip[]> {
  const session = await getSession()
  if (!session) return []
  if (supabase) {
    const { data } = await supabase
      .from('clips')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })
    return (data ?? []).map(rowToClip)
  }
  const clips = readJson<Clip[]>(clipsKey(session.userId, playerId)) ?? []
  return [...clips].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getClip(id: string): Promise<Clip | null> {
  if (supabase) {
    const { data } = await supabase.from('clips').select('*').eq('id', id).maybeSingle()
    return data ? rowToClip(data) : null
  }
  const session = await getSession()
  if (!session) return null
  const players = readJson<Player[]>(playersKey(session.userId)) ?? []
  for (const p of players) {
    const found = (readJson<Clip[]>(clipsKey(session.userId, p.id)) ?? []).find((c) => c.id === id)
    if (found) return found
  }
  return null
}

export async function createClip(playerId: string, title: string, file: File, skillTag: SkillTag): Promise<Clip> {
  const session = await requireSession()
  const id = newId()
  if (supabase) {
    const path = `${session.userId}/${playerId}/${id}-${file.name}`
    const token = await authToken()
    const { url: uploadUrl } = await fetch('/api/storage/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key: path, contentType: file.type }),
    }).then((r) => r.json())
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    await supabase.from('clips').insert({
      id,
      player_id: playerId,
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
  const clips = readJson<Clip[]>(clipsKey(session.userId, playerId)) ?? []
  writeJson(clipsKey(session.userId, playerId), [clip, ...clips])
  return clip
}

export async function updateClip(
  id: string,
  patch: Partial<Pick<Clip, 'status' | 'metrics' | 'feedback' | 'chat'>>
): Promise<void> {
  const session = await requireSession()
  if (supabase) {
    const row: Record<string, unknown> = {}
    if (patch.status !== undefined) row.status = patch.status
    if (patch.metrics !== undefined) row.metrics = patch.metrics
    if (patch.feedback !== undefined) row.feedback = patch.feedback
    if (patch.chat !== undefined) row.chat = patch.chat
    await supabase.from('clips').update(row).eq('id', id)
    return
  }
  const players = readJson<Player[]>(playersKey(session.userId)) ?? []
  for (const p of players) {
    const key = clipsKey(session.userId, p.id)
    const clips = readJson<Clip[]>(key) ?? []
    if (clips.some((c) => c.id === id)) {
      writeJson(key, clips.map((c) => (c.id === id ? { ...c, ...patch } : c)))
      return
    }
  }
}

export async function resolveVideoUrl(clip: Clip): Promise<string | null> {
  if (clip.isSample || !clip.videoKey) return null
  if (supabase) {
    const token = await authToken()
    const { url } = await fetch('/api/storage/download-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key: clip.videoKey }),
    }).then((r) => r.json())
    return url ?? null
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
    metrics: row.metrics ?? undefined,
    feedback: row.feedback ?? undefined,
    chat: row.chat ?? undefined,
    createdAt: row.created_at,
  }
}

// ---------- Coach notes ----------

export async function listCoachNotes(playerId: string, clipId?: string): Promise<CoachNote[]> {
  const session = await getSession()
  if (!session) return []
  if (supabase) {
    let query = supabase.from('coach_notes').select('*').eq('player_id', playerId)
    if (clipId) query = query.eq('clip_id', clipId)
    const { data } = await query.order('frame', { ascending: true })
    return (data ?? []).map(rowToNote)
  }
  const notes = readJson<CoachNote[]>(notesKey(session.userId, playerId)) ?? []
  const filtered = clipId ? notes.filter((n) => n.clipId === clipId) : notes
  return [...filtered].sort((a, b) => a.frame - b.frame)
}

export async function createCoachNote(
  playerId: string,
  note: Omit<CoachNote, 'id' | 'isSample' | 'createdAt'>
): Promise<CoachNote> {
  const session = await requireSession()
  const full: CoachNote = { ...note, id: newId(), isSample: false, createdAt: new Date().toISOString() }
  if (supabase) {
    await supabase.from('coach_notes').insert(noteToRow(full, playerId))
    return full
  }
  const notes = readJson<CoachNote[]>(notesKey(session.userId, playerId)) ?? []
  writeJson(notesKey(session.userId, playerId), [full, ...notes])
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

function noteToRow(n: CoachNote, playerId: string) {
  return {
    id: n.id,
    player_id: playerId,
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

export async function listBookings(playerId: string): Promise<SessionBooking[]> {
  const session = await getSession()
  if (!session) return []
  if (supabase) {
    const { data } = await supabase
      .from('session_bookings')
      .select('*')
      .eq('player_id', playerId)
      .order('starts_at', { ascending: true })
    return (data ?? []).map(rowToBooking)
  }
  const bookings = readJson<SessionBooking[]>(bookingsKey(session.userId, playerId)) ?? []
  return [...bookings].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
}

export async function createBooking(
  playerId: string,
  booking: Omit<SessionBooking, 'id' | 'status' | 'createdAt'>
): Promise<SessionBooking> {
  const session = await requireSession()
  const full: SessionBooking = { ...booking, id: newId(), status: 'booked', createdAt: new Date().toISOString() }
  if (supabase) {
    await supabase.from('session_bookings').insert(bookingToRow(full, playerId))
    return full
  }
  const bookings = readJson<SessionBooking[]>(bookingsKey(session.userId, playerId)) ?? []
  writeJson(bookingsKey(session.userId, playerId), [full, ...bookings])
  return full
}

export async function cancelBooking(id: string): Promise<void> {
  const session = await requireSession()
  if (supabase) {
    await supabase.from('session_bookings').update({ status: 'cancelled' }).eq('id', id)
    return
  }
  const players = readJson<Player[]>(playersKey(session.userId)) ?? []
  for (const p of players) {
    const key = bookingsKey(session.userId, p.id)
    const bookings = readJson<SessionBooking[]>(key) ?? []
    if (bookings.some((b) => b.id === id)) {
      writeJson(key, bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b)))
      return
    }
  }
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

function bookingToRow(b: SessionBooking, playerId: string) {
  return {
    id: b.id,
    player_id: playerId,
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
