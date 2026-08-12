import type { Clip, CoachNote, Player, SessionBooking } from '@/lib/types'

/**
 * The fixed account behind "Continue with demo account" on the login screen.
 * Same email/password every time, so it can be seeded once with a populated
 * history instead of landing on an empty new-account state.
 */
export const DEMO_EMAIL = 'demo@firsttouch.app'
export const DEMO_PASSWORD = 'firsttouch-demo'
export const DEMO_PLAYER_ID = 'demo-player-diego'

export function seedDemoPlayer(accountId: string): Player {
  return {
    id: DEMO_PLAYER_ID,
    accountId,
    name: 'Diego Marín',
    avatarUrl: '/player-avatar.png',
    position: 'CAM',
    age: 17,
    experience: 'club',
    location: 'Valencia, ES',
    attributes: {
      pace: 82,
      shooting: 74,
      dribbling: 88,
      passing: 79,
      physicality: 68,
    },
    consentedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    consentBasis: 'guardian',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export function seedDemoClips(playerId: string): Clip[] {
  void playerId
  const now = Date.now()
  const days = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString()
  return [
    {
      id: 'demo-clip-1',
      title: 'First Touch Control',
      skillTag: '1v1-dribble',
      videoKey: '',
      thumbnailUrl: '/clip-first-touch.png',
      isSample: true,
      status: 'sent_to_coach',
      createdAt: days(2),
    },
    {
      id: 'demo-clip-2',
      title: 'Positioning Masterclass',
      skillTag: 'full-match',
      videoKey: '',
      thumbnailUrl: '/clip-positioning.png',
      isSample: true,
      status: 'sent_to_coach',
      createdAt: days(9),
    },
  ]
}

export function seedDemoCoachNotes(playerId: string): CoachNote[] {
  void playerId
  const now = Date.now()
  const days = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString()
  return [
    {
      id: 'demo-note-1',
      clipId: 'demo-clip-1',
      coachId: 'marcus',
      frame: 8,
      type: 'note',
      text: 'Good early body shape, but plant your standing foot closer to the ball before the touch.',
      durationSec: null,
      isSample: true,
      createdAt: days(2),
    },
    {
      id: 'demo-note-2',
      clipId: 'demo-clip-1',
      coachId: 'marcus',
      frame: 32,
      type: 'note',
      text: 'Great scanning before receiving — now open your body and hips to the left to play forward faster.',
      durationSec: null,
      isSample: true,
      createdAt: days(2),
    },
    {
      id: 'demo-note-3',
      clipId: 'demo-clip-1',
      coachId: 'marcus',
      frame: 55,
      type: 'voice',
      text: 'Voice memo: breaking down your weight transfer on this turn.',
      durationSec: 38,
      isSample: true,
      createdAt: days(1),
    },
    {
      id: 'demo-note-4',
      clipId: 'demo-clip-2',
      coachId: 'elena',
      frame: 40,
      type: 'note',
      text: 'Solid tactical read — hold the offside line a beat longer before the recovery run.',
      durationSec: null,
      isSample: true,
      createdAt: days(8),
    },
  ]
}

export function seedDemoBookings(playerId: string): SessionBooking[] {
  void playerId
  const next = new Date()
  next.setDate(next.getDate() + ((2 - next.getDay() + 7) % 7 || 7))
  next.setHours(17, 30, 0, 0)
  return [
    {
      id: 'demo-booking-1',
      coachId: 'marcus',
      startsAt: next.toISOString(),
      durationMin: 45,
      focus: ['Finishing', 'First touch'],
      level: 'Competitive club',
      notes: null,
      status: 'booked',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}
