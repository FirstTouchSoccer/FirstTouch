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

export type ClipStatus = 'uploaded' | 'analyzing' | 'analyzed' | 'sent_to_coach'

export type SkillTag =
  | 'shot-velocity'
  | 'free-kick-curve'
  | 'penalty-placement'
  | '1v1-dribble'
  | 'full-match'

/** Movement metrics extracted from a clip (MediaPipe Pose, or simulated fallback). */
export interface PoseMetrics {
  source: 'mediapipe' | 'simulated'
  framesAnalyzed: number
  durationSec: number
  avgKneeFlexionL: number
  avgKneeFlexionR: number
  kneeSymmetry: number
  hipStability: number
  armBalance: number
  movementIntensity: number
  posturalLean: number
}

export interface DrillItem {
  name: string
  description: string
  duration: string
}

export interface TrainingDay {
  day: string
  focus: string
  drills: DrillItem[]
}

export interface Scores {
  technique: number
  balance: number
  movement: number
  consistency: number
  athleticism: number
}

export interface Feedback {
  source: 'claude' | 'mock'
  summary: string
  strengths: string[]
  improvements: string[]
  scores: Scores
  trainingPlan: TrainingDay[]
  createdAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface Clip {
  id: string
  title: string
  skillTag: SkillTag
  videoKey: string // storage path (Supabase) or IndexedDB key (demo)
  thumbnailUrl?: string // sample clips only — real uploads have no stored thumbnail yet
  isSample: boolean
  status: ClipStatus
  metrics?: PoseMetrics
  feedback?: Feedback
  chat?: ChatMessage[] // follow-up Q&A about this clip's feedback
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
