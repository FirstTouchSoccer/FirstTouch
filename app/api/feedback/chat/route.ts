import Anthropic from '@anthropic-ai/sdk'
import { buildMockChatReply, MAX_CHAT_TURNS } from '@/lib/mock-chat'
import { movementReads } from '@/lib/read'
import { isTrustedOrigin } from '@/lib/verify-origin'
import type { ChatMessage, Feedback, PlayerProfile, PoseMetrics } from '@/lib/types'

export const maxDuration = 60

const SYSTEM_PROMPT = `You are the same elite youth soccer development coach who wrote the FirstTouch
analysis below, now answering the player/parent's follow-up questions about it in a short chat.
Ground every answer in the summary, strengths, improvements, scores, and training plan you already
produced — do not invent new measurements or cite exact joint angles/percentages, since the
underlying signals are a low-resolution single-camera estimate.
Keep replies short: 2-4 sentences, conversational, parent-friendly, no markdown headers or lists
unless genuinely helpful.
If asked something unrelated to this player's development (medical concerns, other sports, anything
outside soccer coaching), gently redirect to booking time with a human coach instead of answering.`

export async function POST(req: Request) {
  if (!isTrustedOrigin(req)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { profile, metrics, feedback, clipTitle, history, question } = (await req.json()) as {
    profile: Pick<PlayerProfile, 'name' | 'age' | 'position' | 'attributes'>
    metrics: PoseMetrics
    feedback: Feedback
    clipTitle: string
    history: ChatMessage[]
    question: string
  }

  if (!profile || !metrics || !feedback || !question?.trim()) {
    return Response.json({ error: 'profile, metrics, feedback, and question are required' }, { status: 400 })
  }

  const askedSoFar = (history ?? []).filter((m) => m.role === 'user').length
  if (askedSoFar >= MAX_CHAT_TURNS) {
    return Response.json({ error: 'limit_reached' }, { status: 429 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ reply: buildMockChatReply(feedback, metrics, question) })
  }

  const reads = movementReads(metrics)
  const anthropic = new Anthropic()
  try {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5',
      // Conversational follow-up, not the full structured analysis — no
      // extended thinking here, keeps cost/latency low for a chat reply.
      max_tokens: 400,
      system: [
        SYSTEM_PROMPT,
        '',
        `Player: ${profile.name}, age ${profile.age ?? 'unknown'}, position ${profile.position}.`,
        `Clip: "${clipTitle}" (movement source: ${metrics.source === 'mediapipe' ? 'in-browser pose estimation' : 'simulated demo data'}).`,
        `Movement read: ${reads.map((r) => `${r.label}: ${r.band}`).join(', ')}.`,
        `Summary already given: ${feedback.summary}`,
        `Strengths already given: ${feedback.strengths.join('; ')}`,
        `Improvements already given: ${feedback.improvements.join('; ')}`,
        `Scores already given: ${Object.entries(feedback.scores).map(([k, v]) => `${k} ${v}`).join(', ')}`,
      ].join('\n'),
      messages: [
        ...(history ?? []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content: question },
      ],
    })

    const text = response.content.find((b) => b.type === 'text')?.text ?? ''
    return Response.json({ reply: text || buildMockChatReply(feedback, metrics, question) })
  } catch (err) {
    console.error('Claude chat reply failed, returning mock:', err)
    return Response.json({ reply: buildMockChatReply(feedback, metrics, question) })
  }
}
