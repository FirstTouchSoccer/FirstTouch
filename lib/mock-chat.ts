/**
 * Server- and client-side mock reply generator — used when ANTHROPIC_API_KEY
 * is not set (or the API call fails), so follow-up Q&A still works end to
 * end. Pulls from the clip's real feedback rather than returning something
 * generic, so it still feels grounded in demo mode.
 */
import type { Feedback, PoseMetrics } from '@/lib/types'

/** Bounds worst-case per-clip AI spend — see app/api/feedback/chat/route.ts. */
export const MAX_CHAT_TURNS = 12

export function buildMockChatReply(feedback: Feedback, metrics: PoseMetrics, question: string): string {
  const q = question.toLowerCase()

  if (q.includes('score') || q.includes('rating') || q.includes('number')) {
    const lowest = Object.entries(feedback.scores).sort((a, b) => a[1] - b[1])[0]
    return `Scores come straight from the movement read for this clip — ${lowest[0]} was the lowest this time at ${lowest[1]}. That tracks with "${feedback.improvements[0] ?? 'the focus area above'}." Re-film after working the training plan and you'll see it move.`
  }

  if (q.includes('drill') || q.includes('training') || q.includes('plan') || q.includes('practice')) {
    const day = feedback.trainingPlan[0]
    const drill = day?.drills[0]
    return drill
      ? `Start with "${drill.name}" from ${day.day} — ${drill.description} (${drill.duration}). That one's sequenced first because it targets your biggest focus area.`
      : "Follow the training plan above in order — it's sequenced from your biggest focus area down."
  }

  if (q.includes('strength') || q.includes('good at') || q.includes('doing well')) {
    return feedback.strengths[0]
      ? `Clearest strength on this clip: ${feedback.strengths[0]}. Keep reinforcing that while you work the focus areas below.`
      : 'Keep working the fundamentals — strengths build fastest with repetition.'
  }

  if (q.includes('improve') || q.includes('weak') || q.includes('work on') || q.includes('focus')) {
    return feedback.improvements[0]
      ? `Biggest focus area right now: ${feedback.improvements[0]}. The training plan above targets this first.`
      : 'Keep following the training plan above — it targets your biggest gap first.'
  }

  if (q.includes('camera') || q.includes('record') || q.includes('accura') || q.includes('how does this work')) {
    return metrics.source === 'mediapipe'
      ? "This read comes from in-browser pose tracking on your actual clip — it's a general movement estimate from a single phone camera, not lab-grade motion capture, so treat the bands as tendencies, not exact measurements."
      : "This particular clip used simulated demo data rather than live pose tracking, so treat these numbers as a placeholder — re-upload on a supported device for a real read."
  }

  return `${feedback.summary} Ask me about your scores, strengths, or the training plan for more specifics.`
}
