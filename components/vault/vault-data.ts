export type Category = 'Tactics' | 'Drills' | 'Match Highlights' | 'Skill Breakdowns'

export type Video = {
  id: string
  title: string
  category: Category
  duration: string
  views: string
  thumb: string
  tags: string[]
}

export const categories: Category[] = [
  'Tactics',
  'Drills',
  'Match Highlights',
  'Skill Breakdowns',
]

export const videos: Video[] = [
  {
    id: 'v1',
    title: 'Weak Foot Mastery: Left-Side Finishing',
    category: 'Skill Breakdowns',
    duration: '0:58',
    views: '12.4k',
    thumb: '/vault-skill.png',
    tags: ['WeakFoot', 'PassingAccuracy', 'FirstTouch'],
  },
  {
    id: 'v2',
    title: 'Reading Space: Positioning Between Lines',
    category: 'Tactics',
    duration: '2:14',
    views: '8.1k',
    thumb: '/vault-tactics.png',
    tags: ['Positioning', 'Tactical', 'OffBall'],
  },
  {
    id: 'v3',
    title: 'Cone Ladder: Close-Control Dribbling',
    category: 'Drills',
    duration: '1:32',
    views: '19.7k',
    thumb: '/vault-drill.png',
    tags: ['FirstTouch', 'Dribbling', 'Agility'],
  },
  {
    id: 'v4',
    title: 'Match Highlights: Counter-Attack Goals',
    category: 'Match Highlights',
    duration: '3:05',
    views: '31.2k',
    thumb: '/vault-highlight.png',
    tags: ['SprintSpeed', 'Finishing', 'Transition'],
  },
  {
    id: 'v5',
    title: 'First Touch Under Pressure',
    category: 'Skill Breakdowns',
    duration: '1:12',
    views: '9.8k',
    thumb: '/clip-first-touch.png',
    tags: ['FirstTouch', 'BallControl'],
  },
  {
    id: 'v6',
    title: 'Half-Space Overloads Explained',
    category: 'Tactics',
    duration: '2:48',
    views: '5.6k',
    thumb: '/clip-positioning.png',
    tags: ['Positioning', 'Tactical', 'Passing'],
  },
]

// AI curates these after an upload detects a weakness
export const recommended = {
  reason: 'Low left-foot accuracy detected in your last upload',
  videoIds: ['v1', 'v5', 'v3'],
}
