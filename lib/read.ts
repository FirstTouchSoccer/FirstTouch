/**
 * Turns raw pose signals into a *generalized* movement read.
 *
 * A single ordinary phone camera can't measure joint angles to lab precision,
 * so we deliberately don't surface exact degrees/percentages as if they were
 * exact. Instead each signal is bucketed into a plain-language band. The raw
 * numbers still live on `PoseMetrics` (shown in a de-emphasized "technical
 * readout") — but the headline read is qualitative on purpose. Pure
 * functions, safe to import on both server and client.
 */
import type { PoseMetrics } from '@/lib/types'

export type Band = 'Developing' | 'Solid' | 'Strong'

export function toBand(score: number): Band {
  if (score >= 75) return 'Strong'
  if (score >= 55) return 'Solid'
  return 'Developing'
}

export interface MovementRead {
  key: string
  label: string
  band: Band
  blurb: string
}

/** Posture: less torso lean is better. Map lean degrees to a 0–100 score. */
function postureScore(m: PoseMetrics): number {
  return Math.max(0, Math.min(100, 100 - m.posturalLean * 5))
}

export function movementReads(m: PoseMetrics): MovementRead[] {
  return [
    {
      key: 'balance',
      label: 'Balance & base',
      band: toBand(m.hipStability),
      blurb: 'How steady and grounded the body looks through movement.',
    },
    {
      key: 'symmetry',
      label: 'Left / right symmetry',
      band: toBand(m.kneeSymmetry),
      blurb: 'Whether both legs appear to work evenly.',
    },
    {
      key: 'workrate',
      label: 'Work rate',
      band: toBand(m.movementIntensity),
      blurb: 'How much dynamic, match-speed movement is in the clip.',
    },
    {
      key: 'posture',
      label: 'Posture',
      band: toBand(postureScore(m)),
      blurb: 'How upright and controlled the torso stays.',
    },
  ]
}
