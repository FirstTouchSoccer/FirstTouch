// Real coach roster — empty until actual coaches are onboarded. This used to
// ship with three fabricated profiles (fake names, star ratings, review
// counts, and "UEFA A" certifications) presented as real bookable people —
// that's exactly the kind of fabricated-review/credential claim the FTC's
// rule on fake reviews and testimonials prohibits, not just a cosmetic
// placeholder. Never reintroduce specific fake ratings/review counts/
// credentials here; add real coaches with real, verifiable stats only.
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

export const coaches: Coach[] = []

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
