// Curated badges/drills gallery — editorial content nobody edits at runtime,
// so it stays static. Real per-player data (attributes, session history,
// career stats) is computed from the store, not hardcoded here anymore.

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
    meta: 'Skill milestone',
    thumb: '/vault-skill.png',
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
