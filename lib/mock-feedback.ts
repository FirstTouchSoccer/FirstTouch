/**
 * Server-side mock feedback generator — used when ANTHROPIC_API_KEY is not set
 * (or the API call fails), so the end-to-end flow always completes. Output is
 * derived from the actual pose metrics so it still feels personalized, and is
 * clearly labelled `source: "mock"` in the UI. The training plan draws from
 * the same curated drill bank the real Claude path uses, so a fallback (e.g.
 * during an Anthropic outage) is still stage-appropriate and grounded rather
 * than a fixed, unrelated plan.
 */
import { movementReads } from '@/lib/read'
import { drillsFor, type DrillCategory } from '@/lib/coaching-reference'
import type { Feedback, Player, PoseMetrics, Scores } from '@/lib/types'

export function buildMockFeedback(
  profile: Pick<Player, 'name' | 'position' | 'experience'>,
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
    trainingPlan: buildTrainingPlan(profile.experience, metrics),
    createdAt: new Date().toISOString(),
  }
}

const DAY_LABELS = ['Week 1 · Mon', 'Week 1 · Thu', 'Week 2 · Mon', 'Week 2 · Thu']

function buildTrainingPlan(experience: Player['experience'], metrics: PoseMetrics) {
  const reads = movementReads(metrics)
  const weak = reads.filter((r) => r.band === 'Developing')
  const targets = (weak.length > 0 ? weak : reads.filter((r) => r.band === 'Solid')).slice(0, 3)

  const days = targets.map((read, i) => ({
    day: DAY_LABELS[i] ?? DAY_LABELS[DAY_LABELS.length - 1],
    focus: read.label,
    drills: drillsFor(read.key as DrillCategory, experience)
      .slice(0, 2)
      .map((d) => ({ name: d.name, description: d.description, duration: d.duration })),
  }))

  days.push({
    day: DAY_LABELS[DAY_LABELS.length - 1],
    focus: 'Putting it together',
    drills: [
      {
        name: 'Circuit repeat + re-film',
        description: 'Repeat the same drill from this clip and film it — upload to compare scores.',
        duration: '20 min',
      },
    ],
  })

  return days
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
