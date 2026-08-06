import Anthropic from '@anthropic-ai/sdk'
import { buildMockFeedback } from '@/lib/mock-feedback'
import { movementReads } from '@/lib/read'
import { isTrustedOrigin } from '@/lib/verify-origin'
import { experienceLabel, type Player, type PoseMetrics } from '@/lib/types'

export const maxDuration = 120

// JSON schema for structured outputs — guarantees parseable coaching feedback.
// (Structured outputs don't allow numeric min/max constraints; ranges are
// documented in descriptions and enforced by the prompt.)
const FEEDBACK_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: "3-4 sentence overall assessment addressed to the player's parent/coach.",
    },
    strengths: {
      type: 'array',
      items: { type: 'string' },
      description: '2-4 specific strengths grounded in the metrics.',
    },
    improvements: {
      type: 'array',
      items: { type: 'string' },
      description: '2-4 specific areas to improve, grounded in the metrics.',
    },
    scores: {
      type: 'object',
      properties: {
        technique: { type: 'integer', description: '0-100' },
        balance: { type: 'integer', description: '0-100' },
        movement: { type: 'integer', description: '0-100' },
        consistency: { type: 'integer', description: '0-100' },
        athleticism: { type: 'integer', description: '0-100' },
      },
      required: ['technique', 'balance', 'movement', 'consistency', 'athleticism'],
      additionalProperties: false,
    },
    trainingPlan: {
      type: 'array',
      description: 'A 1-2 week plan with 3-5 training days.',
      items: {
        type: 'object',
        properties: {
          day: { type: 'string', description: 'e.g. "Week 1 · Mon"' },
          focus: { type: 'string' },
          drills: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                duration: { type: 'string', description: 'e.g. "15 min"' },
              },
              required: ['name', 'description', 'duration'],
              additionalProperties: false,
            },
          },
        },
        required: ['day', 'focus', 'drills'],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'strengths', 'improvements', 'scores', 'trainingPlan'],
  additionalProperties: false,
} as const

const SYSTEM_PROMPT = `You are an elite youth soccer development coach writing for the FirstTouch app.
You receive a *general* movement read of a young player practicing — bucketed signals estimated from a single ordinary phone camera (via pose estimation) — plus the player's profile.
These signals are approximate and low-resolution. Speak about overall movement patterns and tendencies, NOT exact joint angles or percentages, and never imply lab-grade precision.
Write encouraging but honest, specific feedback a club-soccer parent would find worth paying for:
- Base your read on the general signals and the player's profile; describe what the movement suggests as things to work on, not as precise measurements.
- Match drill difficulty to the player's age and self-rated attributes; drills must be doable alone or with one partner, minimal equipment.
- Scores are 0-100 where 50 is typical, 70+ is strong, 85+ is exceptional.
- Keep language positive and parent-friendly; never shame the player. This is developmental guidance, not medical or injury advice.`

export async function POST(req: Request) {
  if (!isTrustedOrigin(req)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { profile, metrics, clipTitle } = (await req.json()) as {
    profile: Pick<Player, 'name' | 'age' | 'experience' | 'position' | 'attributes'>
    metrics: PoseMetrics
    clipTitle: string
  }

  if (!profile || !metrics) {
    return Response.json({ error: 'profile and metrics are required' }, { status: 400 })
  }

  // No API key configured → labelled mock so the flow still completes.
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ feedback: buildMockFeedback(profile, metrics) })
  }

  const reads = movementReads(metrics)
  const anthropic = new Anthropic()
  try {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5',
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      output_config: { format: { type: 'json_schema', schema: FEEDBACK_SCHEMA } },
      messages: [
        {
          role: 'user',
          content: [
            `Clip: "${clipTitle}"`,
            `Player: ${profile.name}, age ${profile.age ?? 'unknown'}, position ${profile.position}, experience level: ${experienceLabel(profile.experience)}.`,
            `Self-rated attributes (0-99, for context only, not measurements): pace ${profile.attributes.pace}, shooting ${profile.attributes.shooting}, dribbling ${profile.attributes.dribbling}, passing ${profile.attributes.passing}, physicality ${profile.attributes.physicality}.`,
            '',
            `General movement read (approximate, single-camera estimate over ~${metrics.durationSec}s; source: ${metrics.source === 'mediapipe' ? 'in-browser pose estimation' : 'simulated demo data'}):`,
            ...reads.map((r) => `- ${r.label}: ${r.band} — ${r.blurb}`),
            '',
            'Produce the structured feedback and training plan. Do not cite exact angles or percentages.',
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ],
    })

    const text = response.content.find((b) => b.type === 'text')?.text ?? ''
    const parsed = JSON.parse(text)
    return Response.json({
      feedback: { ...parsed, source: 'claude', createdAt: new Date().toISOString() },
    })
  } catch (err) {
    // Keep live demos resilient: fall back to labelled mock feedback on API errors.
    console.error('Claude feedback failed, returning mock:', err)
    return Response.json({ feedback: buildMockFeedback(profile, metrics) })
  }
}
