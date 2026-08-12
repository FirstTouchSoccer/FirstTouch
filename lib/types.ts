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

export type ExperienceLevel = 'new' | 'developing' | 'club' | 'elite'

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'new', label: 'New to soccer (0-1 yrs)' },
  { value: 'developing', label: 'Developing (rec / school ball)' },
  { value: 'club', label: 'Club / competitive travel' },
  { value: 'elite', label: 'Elite / academy / ODP' },
]

export function experienceLabel(level: ExperienceLevel): string {
  return EXPERIENCE_LEVELS.find((l) => l.value === level)?.label ?? level
}

// Who gave consent for this player's profile: a parent/guardian registering
// a child, or the player themselves (18+) registering their own account.
// Recorded per-player since it's the legal basis for that player's data --
// see the "Who can create an account" section of the Terms of Service.
export type ConsentBasis = 'guardian' | 'self'

export interface Player {
  id: string
  accountId: string
  name: string
  avatarUrl: string
  position: Position
  age: number | null
  experience: ExperienceLevel
  location: string
  attributes: Attributes
  consentedAt: string
  consentBasis: ConsentBasis
  createdAt: string
}

export type SubscriptionStatus =
  | 'none'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

// Statuses that unlock unlimited analyses. past_due gets a grace period since
// Stripe is already auto-retrying the card.
export const ENTITLED_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['active', 'trialing', 'past_due']

export function isEntitledStatus(status: SubscriptionStatus): boolean {
  return ENTITLED_SUBSCRIPTION_STATUSES.includes(status)
}

export interface BillingStatus {
  subscriptionStatus: SubscriptionStatus
  isEntitled: boolean
  freeAnalysesUsed: number
  freeAnalysesLimit: number
  currentPeriodEnd: string | null
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
