/**
 * Server-side mock feedback generator — used when ANTHROPIC_API_KEY is not set
 * (or the API call fails), so the end-to-end flow always completes. Output is
 * derived from the actual pose metrics so it still feels personalized, and is
 * clearly labelled `source: "mock"` in the UI.
 */
import type { Feedback, PlayerProfile, PoseMetrics, Scores } from '@/lib/types'

export function buildMockFeedback(
  profile: Pick<PlayerProfile, 'name' | 'position'>,
  metrics: PoseMetrics
): Feedback {
  const scores: Scores = {
    technique: blend(metrics.kneeSymmetry, metrics.armBalance),
    balance: blend(metrics.hipStability, 100 - metrics.posturalLean * 4),
    movement: metrics.movementIntensity,
    consistency: blend(metrics.kneeSymmetry, metrics.hipStability),
    athleticism: blend(metrics.movementIntensity, metrics.armBalance),
  }

  const strengths: string[] = []
  const improvements: string[] = []

  pick(
    metrics.hipStability >= 70,
    strengths,
    'Hips stay level through movement — a stable base for striking and turning',
    improvements,
    'Hips drift sideways during cuts and deceleration; core and glute stability work will tighten this up'
  )
  pick(
    metrics.kneeSymmetry >= 70,
    strengths,
    'Both legs load evenly — good left/right symmetry for a developing player',
    improvements,
    'Leg loading looks uneven between left and right — add single-leg strength work to balance it out'
  )
  pick(
    metrics.movementIntensity >= 60,
    strengths,
    'Work rate and movement intensity stay high across the clip',
    improvements,
    'Movement intensity dips over the clip — build match-speed repetition into sessions'
  )
  pick(
    metrics.posturalLean <= 8,
    strengths,
    'Upright, controlled posture with a good athletic base position',
    improvements,
    'Posture drifts forward at times — staying more compact and upright will improve balance on the ball'
  )

  const firstName = profile.name.split(' ')[0] || 'This player'
  return {
    source: 'mock',
    summary: `${firstName} shows a solid foundation as a ${profile.position}. The analysis picked up ${strengths.length} clear strengths to build on and ${improvements.length} focus areas — the two-week plan below targets the biggest one first.`,
    strengths,
    improvements,
    scores,
    trainingPlan: [
      {
        day: 'Week 1 · Mon',
        focus: 'Balance & base position',
        drills: [
          {
            name: 'Single-leg ball taps',
            description: 'Stand on one leg, tap the ball with the other foot. 3×45s each side.',
            duration: '10 min',
          },
          {
            name: 'Low-gate dribbling',
            description: 'Dribble through 1m gates staying in a low athletic stance the whole run.',
            duration: '15 min',
          },
        ],
      },
      {
        day: 'Week 1 · Thu',
        focus: 'Leg symmetry',
        drills: [
          {
            name: 'Weak-foot wall passes',
            description: '100 passes off a wall, weak foot only, two-touch.',
            duration: '15 min',
          },
          {
            name: 'Split-squat holds',
            description: '3×30s per leg, knee tracking over the toes.',
            duration: '8 min',
          },
        ],
      },
      {
        day: 'Week 2 · Mon',
        focus: 'Match-speed movement',
        drills: [
          {
            name: '5-10-5 shuttles with ball',
            description: '6 reps at full speed; decelerate under control.',
            duration: '12 min',
          },
          {
            name: '1v1 shadow play',
            description: "Mirror a partner's cuts in 30s bursts, 6 rounds.",
            duration: '12 min',
          },
        ],
      },
      {
        day: 'Week 2 · Thu',
        focus: 'Putting it together',
        drills: [
          {
            name: 'Circuit repeat + re-film',
            description: 'Repeat the same drill from this clip and film it — upload to compare scores.',
            duration: '20 min',
          },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  }
}

function blend(a: number, b: number): number {
  return Math.round(Math.min(100, Math.max(0, (a + b) / 2)))
}

function pick(
  isStrength: boolean,
  strengths: string[],
  strengthText: string,
  improvements: string[],
  improvementText: string
) {
  if (isStrength) strengths.push(strengthText)
  else improvements.push(improvementText)
}
