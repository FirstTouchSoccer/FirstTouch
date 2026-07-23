import {
  Award,
  Dumbbell,
  Film,
  Flame,
  Gauge,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export type Attribute = {
  key: string
  label: string
  short: string
  value: number // 0 - 99
}

// 5 core attributes for the skill radar
export const attributes: Attribute[] = [
  { key: 'pace', label: 'Pace', short: 'PAC', value: 82 },
  { key: 'shooting', label: 'Shooting', short: 'SHO', value: 74 },
  { key: 'dribbling', label: 'Dribbling', short: 'DRI', value: 88 },
  { key: 'passing', label: 'Passing', short: 'PAS', value: 79 },
  { key: 'physicality', label: 'Physicality', short: 'PHY', value: 68 },
]

export type MediaKind = 'clip' | 'drill' | 'badge'

export type MediaItem = {
  id: string
  kind: MediaKind
  title: string
  meta: string
  thumb: string
}

export const mediaItems: MediaItem[] = [
  {
    id: 'm1',
    kind: 'clip',
    title: 'First Touch Control',
    meta: '+12% precision',
    thumb: '/clip-first-touch.png',
  },
  {
    id: 'm2',
    kind: 'drill',
    title: 'Cone Ladder Dribbling',
    meta: '1:32 · saved',
    thumb: '/vault-drill.png',
  },
  {
    id: 'm3',
    kind: 'clip',
    title: 'Counter-Attack Goals',
    meta: 'Match highlight',
    thumb: '/vault-highlight.png',
  },
  {
    id: 'm4',
    kind: 'badge',
    title: 'Power Target Hit',
    meta: '68 mph shot',
    thumb: '/vault-skill.png',
  },
  {
    id: 'm5',
    kind: 'clip',
    title: 'Positioning Masterclass',
    meta: 'Tactical clip',
    thumb: '/clip-positioning.png',
  },
  {
    id: 'm6',
    kind: 'drill',
    title: 'Half-Space Overloads',
    meta: '2:48 · saved',
    thumb: '/vault-tactics.png',
  },
]

export const mediaFilters: { key: MediaKind | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'clip', label: 'AI Clips' },
  { key: 'drill', label: 'Drills' },
  { key: 'badge', label: 'Badges' },
]

export type Session = {
  id: string
  title: string
  coach: string
  date: string
  duration: string
  type: 'session' | 'report'
  icon: LucideIcon
}

export const sessions: Session[] = [
  {
    id: 's1',
    title: '1-on-1: Finishing Under Pressure',
    coach: 'Marcus Bell',
    date: 'Mar 18',
    duration: '45 min',
    type: 'session',
    icon: Target,
  },
  {
    id: 's2',
    title: 'Weekly Report Card',
    coach: 'AI Analysis',
    date: 'Mar 15',
    duration: 'Downloaded',
    type: 'report',
    icon: Award,
  },
  {
    id: 's3',
    title: '1-on-1: Tactical Positioning',
    coach: 'Elena Rossi',
    date: 'Mar 11',
    duration: '60 min',
    type: 'session',
    icon: Target,
  },
  {
    id: 's4',
    title: '1-on-1: Explosive Acceleration',
    coach: 'Diego Fernández',
    date: 'Mar 6',
    duration: '45 min',
    type: 'session',
    icon: Target,
  },
  {
    id: 's5',
    title: 'Monthly Report Card',
    coach: 'AI Analysis',
    date: 'Mar 1',
    duration: 'Downloaded',
    type: 'report',
    icon: Award,
  },
]

export type CareerStat = {
  label: string
  value: string
  icon: LucideIcon
}

export const careerStats: CareerStat[] = [
  { label: 'AI Uploads', value: '24', icon: Film },
  { label: 'Sessions', value: '12', icon: Trophy },
  { label: 'Day Streak', value: '5', icon: Flame },
  { label: 'Badges', value: '9', icon: Award },
]

export const highlights: { label: string; value: string; icon: LucideIcon }[] =
  [
    { label: 'Top Shot Speed', value: '68 mph', icon: Zap },
    { label: 'Max Sprint', value: '27.4 km/h', icon: Gauge },
    { label: 'Stamina Index', value: '91 / 99', icon: Dumbbell },
  ]
