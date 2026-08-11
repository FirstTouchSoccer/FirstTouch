/**
 * Server-side mock feedback generator — used when ANTHROPIC_API_KEY is not set
 * (or the API call fails), so the end-to-end flow always completes. Output is
 * derived from the actual pose metrics so it still feels personalized, and is
 * clearly labelled `source: "mock"` in the UI. The training plan draws from
 * the same curated drill bank the real Claude path uses, so a fallback (e.g.
 * during an Anthropic outage) is still stage-appropriate and grounded rather
 * than a fixed, unrelated plan.
 *
 * The curated drill bank itself (lib/coaching-reference.ts) is English-only —
 * translating that whole library was out of scope here — so in Russian mode
 * this fallback's own sentences are in Russian, but a drill's name/description
 * pulled from the bank stays in English. The primary (real Claude) path
 * doesn't have this gap: Claude is instructed to write natively in the
 * requested language regardless of the reference material's language.
 */
import { movementReads } from '@/lib/read'
import { drillsFor, type DrillCategory } from '@/lib/coaching-reference'
import { en } from '@/lib/i18n/en'
import { ru } from '@/lib/i18n/ru'
import type { Language } from '@/lib/i18n/types'
import type { Feedback, Player, PoseMetrics, Scores } from '@/lib/types'

export function buildMockFeedback(
  profile: Pick<Player, 'name' | 'position' | 'experience'>,
  metrics: PoseMetrics,
  language: Language = 'en'
): Feedback {
  const t = (language === 'ru' ? ru : en).mockFeedback

  const scores: Scores = {
    technique: blend(metrics.kneeSymmetry, metrics.armBalance),
    balance: blend(metrics.hipStability, 100 - metrics.posturalLean * 4),
    movement: metrics.movementIntensity,
    consistency: blend(metrics.kneeSymmetry, metrics.hipStability),
    athleticism: blend(metrics.movementIntensity, metrics.armBalance),
  }

  const strengths: string[] = []
  const improvements: string[] = []

  pick(metrics.hipStability >= 70, strengths, t.hipsStrength, improvements, t.hipsImprove)
  pick(metrics.kneeSymmetry >= 70, strengths, t.kneeStrength, improvements, t.kneeImprove)
  pick(metrics.movementIntensity >= 60, strengths, t.intensityStrength, improvements, t.intensityImprove)
  pick(metrics.posturalLean <= 8, strengths, t.postureStrength, improvements, t.postureImprove)

  const firstName = profile.name.split(' ')[0] || profile.position
  return {
    source: 'mock',
    summary: t.summary(firstName, profile.position, strengths.length, improvements.length),
    strengths,
    improvements,
    scores,
    trainingPlan: buildTrainingPlan(profile.experience, metrics, t),
    createdAt: new Date().toISOString(),
  }
}

function buildTrainingPlan(
  experience: Player['experience'],
  metrics: PoseMetrics,
  t: (typeof en)['mockFeedback']
) {
  const reads = movementReads(metrics)
  const weak = reads.filter((r) => r.band === 'Developing')
  const targets = (weak.length > 0 ? weak : reads.filter((r) => r.band === 'Solid')).slice(0, 3)

  const days = targets.map((read, i) => ({
    day: t.dayLabels[i] ?? t.dayLabels[t.dayLabels.length - 1],
    focus: read.label,
    drills: drillsFor(read.key as DrillCategory, experience)
      .slice(0, 2)
      .map((d) => ({ name: d.name, description: d.description, duration: d.duration })),
  }))

  days.push({
    day: t.dayLabels[t.dayLabels.length - 1],
    focus: t.puttingTogether,
    drills: [
      {
        name: t.circuitDrillName,
        description: t.circuitDrillDesc,
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
