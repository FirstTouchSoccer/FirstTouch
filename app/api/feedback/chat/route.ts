import Anthropic from '@anthropic-ai/sdk'
import { buildMockChatReply, MAX_CHAT_TURNS } from '@/lib/mock-chat'
import { movementReads } from '@/lib/read'
import { isTrustedOrigin } from '@/lib/verify-origin'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import { getOrCreateBillingRow, checkAndConsumeChatUsage } from '@/lib/billing-server'
import { isEntitledStatus, experienceLabel, type ChatMessage, type Feedback, type Player, type PoseMetrics, type SubscriptionStatus } from '@/lib/types'
import type { Language } from '@/lib/i18n/types'

// Belt-and-suspenders bounds on client-supplied fields that flow straight
// into the prompt. `history` in particular drives the per-clip MAX_CHAT_TURNS
// cap client-side by array length — a forged request could otherwise send
// an oversized or fabricated history to inflate a single call's cost. These
// caps keep any one call's worst-case token count (and therefore cost)
// bounded regardless of what's sent, on top of the monthly counters below.
const MAX_HISTORY_MESSAGES = MAX_CHAT_TURNS * 2 // user+assistant pairs
const MAX_MESSAGE_CHARS = 2000

export const maxDuration = 60

const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', ru: 'Russian' }

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

  const { profile, metrics, feedback, clipTitle, history, question, language: rawLanguage } = (await req.json()) as {
    profile: Pick<Player, 'name' | 'age' | 'experience' | 'position' | 'attributes'>
    metrics: PoseMetrics
    feedback: Feedback
    clipTitle: string
    history: ChatMessage[]
    question: string
    language?: Language
  }
  const language: Language = rawLanguage === 'ru' ? 'ru' : 'en'

  if (!profile || !metrics || !feedback || !question?.trim()) {
    return Response.json({ error: 'profile, metrics, feedback, and question are required' }, { status: 400 })
  }

  // Bound request size regardless of what MAX_CHAT_TURNS or the monthly
  // counters enforce elsewhere — a single oversized or fabricated request
  // shouldn't be able to blow past the per-call cost this route is sized
  // for. history/question length is otherwise entirely client-controlled.
  if ((history?.length ?? 0) > MAX_HISTORY_MESSAGES || question.length > MAX_MESSAGE_CHARS) {
    return Response.json({ error: 'request_too_large' }, { status: 400 })
  }
  if (history?.some((m) => (m.content?.length ?? 0) > MAX_MESSAGE_CHARS)) {
    return Response.json({ error: 'request_too_large' }, { status: 400 })
  }

  // Same real-auth requirement as /api/feedback — this route was missed when
  // that gating landed, leaving it callable by anyone with no session at all
  // (isTrustedOrigin alone doesn't stop a forged request), an unmetered path
  // to the paid Claude API. Also require the account to have actually
  // unlocked feedback already (entitled, or has used a free analysis) so a
  // never-analyzed free account can't get unlimited chat without ever
  // consuming — or paying for — a real analysis.
  if (supabaseConfigured) {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data, error } = await supabase!.auth.getUser(token)
    if (error || !data.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const row = await getOrCreateBillingRow(data.user.id)
      const entitled = isEntitledStatus(row.subscription_status as SubscriptionStatus)
      if (!entitled && row.free_analyses_used < 1) {
        return Response.json({ error: 'no_analysis_yet' }, { status: 403 })
      }

      // MAX_CHAT_TURNS (checked client-side, and implicitly bounded above by
      // MAX_HISTORY_MESSAGES) caps one clip's thread, but a scripted client
      // could still call this endpoint indefinitely by sending a forged short
      // history each time. This counter is server-tracked per account, so it
      // holds no matter what history the request claims.
      const chatUsage = await checkAndConsumeChatUsage(data.user.id)
      if (!chatUsage.allowed) {
        return Response.json(
          {
            error: 'chat_monthly_cap_reached',
            message: "You've reached this month's chat limit — more opens up next month.",
          },
          { status: 429 },
        )
      }
    } catch (err) {
      console.error('Billing check failed in feedback/chat:', err)
      return Response.json({ error: 'billing_check_failed' }, { status: 500 })
    }
  }

  const askedSoFar = (history ?? []).filter((m) => m.role === 'user').length
  if (askedSoFar >= MAX_CHAT_TURNS) {
    return Response.json({ error: 'limit_reached' }, { status: 429 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ reply: buildMockChatReply(feedback, metrics, question, language) })
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
        `Player: ${profile.name}, age ${profile.age ?? 'unknown'}, position ${profile.position}, experience level: ${experienceLabel(profile.experience)}.`,
        `Clip: "${clipTitle}" (movement source: ${metrics.source === 'mediapipe' ? 'in-browser pose estimation' : 'simulated demo data'}).`,
        `Movement read: ${reads.map((r) => `${r.label}: ${r.band}`).join(', ')}.`,
        `Summary already given: ${feedback.summary}`,
        `Strengths already given: ${feedback.strengths.join('; ')}`,
        `Improvements already given: ${feedback.improvements.join('; ')}`,
        `Scores already given: ${Object.entries(feedback.scores).map(([k, v]) => `${k} ${v}`).join(', ')}`,
        language !== 'en' ? `Reply entirely in ${LANGUAGE_NAMES[language]}, regardless of what language the question was asked in.` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      messages: [
        ...(history ?? []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content: question },
      ],
    })

    const text = response.content.find((b) => b.type === 'text')?.text ?? ''
    return Response.json({ reply: text || buildMockChatReply(feedback, metrics, question, language) })
  } catch (err) {
    console.error('Claude chat reply failed, returning mock:', err)
    return Response.json({ reply: buildMockChatReply(feedback, metrics, question, language) })
  }
}
