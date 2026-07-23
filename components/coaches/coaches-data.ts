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

export const specializationFilters = [
  'All',
  'First Touch',
  'Dribbling',
  'Finishing',
  'Positioning',
  'Sprint Mechanics',
] as const

export type FeedbackNote = {
  id: string
  time: string
  frame: number // 0-100 position on timeline
  type: 'note' | 'voice' | 'video'
  coach: string
  text: string
  duration?: string
}

export const feedbackNotes: FeedbackNote[] = [
  {
    id: 'n1',
    time: '0:04',
    frame: 8,
    type: 'note',
    coach: 'Marcus Bell',
    text: 'Good early body shape, but plant your standing foot closer to the ball before the touch.',
  },
  {
    id: 'n2',
    time: '0:14',
    frame: 32,
    type: 'note',
    coach: 'Marcus Bell',
    text: 'Great scanning before receiving — now open your body and hips to the left to play forward faster.',
  },
  {
    id: 'n3',
    time: '0:23',
    frame: 55,
    type: 'voice',
    coach: 'Marcus Bell',
    text: 'Voice memo: breaking down your weight transfer on this turn.',
    duration: '0:38',
  },
  {
    id: 'n4',
    time: '0:37',
    frame: 82,
    type: 'video',
    coach: 'Marcus Bell',
    text: 'Video response: here is the same move done at full speed.',
    duration: '1:12',
  },
]
