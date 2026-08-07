/**
 * Curated coaching reference material for the AI feedback prompt.
 *
 * Claude isn't fine-tuned on soccer coaching material and doesn't retrieve
 * anything live — left alone, it free-generates a training plan from general
 * knowledge. This module is a small, hand-written, vetted bank of stage
 * guidance and drills, filtered per-request by the player's experience level
 * and the specific movement-read bands that came back "Developing," and
 * injected into the prompt as reference material to ground the response in.
 * It's a deliberately simple rule-based filter (map lookups), not a vector
 * store — the reference set is small enough that a proper RAG pipeline would
 * be overkill.
 */
import type { ExperienceLevel } from '@/lib/types'
import type { MovementRead } from '@/lib/read'

export interface StageGuidance {
  focus: string
  coachingEmphasis: string
}

/**
 * Broad developmental-stage emphasis by experience level. This mirrors the
 * widely-used long-term-athlete-development idea that younger/newer players
 * benefit most from ball mastery and enjoyment, while advanced players need
 * fine-margin, decision-speed feedback — general, publicly well-known youth
 * development thinking, not a citation to any specific proprietary program.
 */
export const STAGE_GUIDANCE: Record<ExperienceLevel, StageGuidance> = {
  new: {
    focus: 'Ball mastery and enjoyment over tactics: touches on the ball, basic footwork, confidence moving with the ball.',
    coachingEmphasis:
      'One cue at a time. Celebrate touches and effort, not just clean execution — the goal at this stage is love of the ball.',
  },
  developing: {
    focus: 'Simple 1v1 moves, first touch under light pressure, passing accuracy over short distances.',
    coachingEmphasis:
      'Introduce one decision-making cue per drill (e.g. "check shoulder before you receive"), but keep sessions short and game-like.',
  },
  club: {
    focus: 'Technique held under match-speed pressure, positional awareness, consistency of execution across a full session.',
    coachingEmphasis:
      'Push technical precision and tactical awareness together. Corrections should be specific and actionable, not just "good effort."',
  },
  elite: {
    focus: 'Fine margins: decision speed, weak-foot reliability, off-ball movement, holding technique under fatigue.',
    coachingEmphasis:
      'Assume strong fundamentals. Feedback should isolate the one or two specific things separating good from elite, not restate basics.',
  },
}

export type DrillCategory = 'balance' | 'symmetry' | 'workrate' | 'posture'

export interface ReferenceDrill {
  name: string
  description: string
  duration: string
  /** Experience levels this drill is appropriate for, low to high. */
  levels: ExperienceLevel[]
}

/**
 * Drill bank keyed by the same categories `movementReads()` produces, so a
 * "Developing" band on a read maps directly to a vetted set of drills for
 * that weakness rather than the model inventing one from scratch.
 */
export const DRILL_LIBRARY: Record<DrillCategory, ReferenceDrill[]> = {
  balance: [
    {
      name: 'Single-leg ball taps',
      description: 'Stand on one leg, tap the ball side-to-side with the other foot. 3 sets of 45s each side.',
      duration: '10 min',
      levels: ['new', 'developing', 'club', 'elite'],
    },
    {
      name: 'Low-gate dribbling',
      description: 'Dribble through a line of 1m cone gates, staying in a low, athletic stance the whole run.',
      duration: '15 min',
      levels: ['new', 'developing', 'club'],
    },
    {
      name: 'Single-leg RDL to ball touch',
      description: 'Balance on one leg, hinge forward to tap a stationary ball, return to standing. 3×8 each side.',
      duration: '10 min',
      levels: ['club', 'elite'],
    },
  ],
  symmetry: [
    {
      name: 'Weak-foot wall passes',
      description: '100 passes off a wall using the weaker foot only, two-touch control before each pass.',
      duration: '15 min',
      levels: ['developing', 'club', 'elite'],
    },
    {
      name: 'Split-squat holds',
      description: 'Hold a split-squat position for 30s per leg, focusing on the front knee tracking over the toes.',
      duration: '8 min',
      levels: ['new', 'developing', 'club', 'elite'],
    },
    {
      name: 'Both-feet cone taps',
      description: 'Alternate feet tapping the top of a cone as fast as controlled, 4 sets of 20s.',
      duration: '8 min',
      levels: ['new', 'developing'],
    },
  ],
  workrate: [
    {
      name: '5-10-5 shuttles with ball',
      description: 'Sprint 5-10-5 yard shuttle pattern while dribbling; decelerate under control at each turn. 6 reps.',
      duration: '12 min',
      levels: ['club', 'elite'],
    },
    {
      name: '1v1 shadow play',
      description: "Mirror a partner's cuts and changes of direction for 30s bursts, 6 rounds, no ball.",
      duration: '12 min',
      levels: ['developing', 'club', 'elite'],
    },
    {
      name: 'Follow-the-leader dribble',
      description: 'One player leads a dribble path with changes of pace; partner mirrors it exactly. 4×1 min.',
      duration: '10 min',
      levels: ['new', 'developing'],
    },
  ],
  posture: [
    {
      name: 'Wall posture holds',
      description: 'Stand with back, shoulders and heels against a wall for 20s to feel a tall, upright position, then dribble away holding it.',
      duration: '8 min',
      levels: ['new', 'developing'],
    },
    {
      name: 'Athletic-stance mirror drill',
      description: "Mirror a partner's low, upright athletic stance through lateral shuffles, 6×20s.",
      duration: '10 min',
      levels: ['developing', 'club'],
    },
    {
      name: 'Core-engaged dribble circuit',
      description: 'Dribble a tight cone circuit while consciously bracing the core to resist forward lean, 5 laps.',
      duration: '12 min',
      levels: ['club', 'elite'],
    },
  ],
}

/** Filters the drill bank to a category + experience level, for prompt grounding. */
export function drillsFor(category: DrillCategory, level: ExperienceLevel): ReferenceDrill[] {
  return DRILL_LIBRARY[category].filter((d) => d.levels.includes(level))
}

/**
 * Builds the reference block injected into the feedback prompt: stage
 * guidance for this player's level, plus vetted drills for whichever
 * categories came back "Developing" (the actual weak areas from this clip).
 * Falls back to "Solid" bands if nothing was flagged "Developing" so there's
 * always at least one grounded drill category to draw from.
 */
export function buildReferenceContext(experience: ExperienceLevel, reads: MovementRead[]): string {
  const stage = STAGE_GUIDANCE[experience]
  const weak = reads.filter((r) => r.band === 'Developing')
  const targets = weak.length > 0 ? weak : reads.filter((r) => r.band === 'Solid')

  const drillBlocks = targets.map((read) => {
    const drills = drillsFor(read.key as DrillCategory, experience)
    const list = drills
      .map((d) => `  - ${d.name} (${d.duration}): ${d.description}`)
      .join('\n')
    return `${read.label}:\n${list}`
  })

  return [
    `Development stage focus for this player (${experience}): ${stage.focus}`,
    `Coaching emphasis at this stage: ${stage.coachingEmphasis}`,
    '',
    'Vetted drill bank for this player\'s priority areas (prefer these; adapt wording naturally, but stay grounded in them rather than inventing unrelated drills):',
    ...drillBlocks,
  ].join('\n')
}
