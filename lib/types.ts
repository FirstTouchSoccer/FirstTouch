export interface Session {
  userId: string
  email: string
}

export type Position =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LW'
  | 'RW'
  | 'ST'

export interface Attributes {
  pace: number
  shooting: number
  dribbling: number
  passing: number
  physicality: number
}

export interface PlayerProfile {
  id: string
  email: string
  name: string
  avatarUrl: string
  position: Position
  age: number | null
  location: string
  attributes: Attributes
  createdAt: string
}

export type ClipStatus = 'uploaded' | 'sent_to_coach'

export type SkillTag =
  | 'shot-velocity'
  | 'free-kick-curve'
  | 'penalty-placement'
  | '1v1-dribble'
  | 'full-match'

export interface Clip {
  id: string
  title: string
  skillTag: SkillTag
  videoKey: string // storage path (Supabase) or IndexedDB key (demo)
  thumbnailUrl?: string // sample clips only — real uploads have no stored thumbnail yet
  isSample: boolean
  status: ClipStatus
  createdAt: string
}

export type CoachNoteType = 'note' | 'voice' | 'video'

export interface CoachNote {
  id: string
  clipId: string
  coachId: string
  frame: number // 0-100 position on the clip timeline
  type: CoachNoteType
  text: string
  durationSec: number | null
  isSample: boolean
  createdAt: string
}

export interface SessionBooking {
  id: string
  coachId: string
  startsAt: string // ISO timestamp
  durationMin: number
  focus: string[]
  level: string
  notes: string | null
  status: 'booked' | 'cancelled'
  createdAt: string
}
