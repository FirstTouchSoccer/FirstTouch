// Static roster — illustrative profiles, not real people yet. Nobody edits
// this at runtime, so it stays a plain module rather than a database table.
// coach_notes/session_bookings reference coaches by `id`, never by name, so
// there's exactly one spelling of each coach's name in the whole app.

export type Coach = {
  id: string
  name: string
  avatar: string
  title: string
  badges: string[]
  specializations: string[]
  rating: number
  reviews: number
  rate: number
  bio: string
}

export const coaches: Coach[] = [
  {
    id: 'marcus',
    name: 'Marcus Bell',
    avatar: '/coach-marcus.png',
    title: 'Ex-Academy Head Coach',
    badges: ['UEFA A', 'Pro Verified'],
    specializations: ['Attacking Midfield', 'First Touch', 'Vision'],
    rating: 4.9,
    reviews: 214,
    rate: 65,
    bio: '12 years developing academy talent. Specializes in receiving under pressure and scanning habits.',
  },
  {
    id: 'elena',
    name: 'Elena Roos',
    avatar: '/coach-elena.png',
    title: 'Performance Analyst & Coach',
    badges: ['UEFA B', 'Data Certified'],
    specializations: ['Sprint Mechanics', 'Positioning', 'Analytics'],
    rating: 4.8,
    reviews: 156,
    rate: 58,
    bio: 'Blends video breakdown with sports science to fix off-ball movement and acceleration.',
  },
  {
    id: 'diego',
    name: 'Diego Ferran',
    avatar: '/coach-diego.png',
    title: 'Former Pro Winger',
    badges: ['Pro Verified', '10+ yrs Pro'],
    specializations: ['1v1 Dribbling', 'Weak Foot', 'Finishing'],
    rating: 5.0,
    reviews: 98,
    rate: 80,
    bio: 'Played 300+ pro matches. Teaches the exact 1v1 patterns and finishing angles used at the top level.',
  },
]

export function coachById(id: string): Coach | undefined {
  return coaches.find((c) => c.id === id)
}

export const specializationFilters = [
  'All',
  'First Touch',
  'Dribbling',
  'Finishing',
  'Positioning',
  'Sprint Mechanics',
] as const
