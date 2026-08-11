/**
 * Server- and client-side mock reply generator — used when ANTHROPIC_API_KEY
 * is not set (or the API call fails), so follow-up Q&A still works end to
 * end. Pulls from the clip's real feedback rather than returning something
 * generic, so it still feels grounded in demo mode.
 */
import type { Feedback, PoseMetrics } from '@/lib/types'
import type { Language } from '@/lib/i18n/types'

/** Bounds worst-case per-clip AI spend — see app/api/feedback/chat/route.ts. */
export const MAX_CHAT_TURNS = 12

const KEYWORDS: Record<Language, Record<'score' | 'drill' | 'strength' | 'improve' | 'camera', string[]>> = {
  en: {
    score: ['score', 'rating', 'number'],
    drill: ['drill', 'training', 'plan', 'practice'],
    strength: ['strength', 'good at', 'doing well'],
    improve: ['improve', 'weak', 'work on', 'focus'],
    camera: ['camera', 'record', 'accura', 'how does this work'],
  },
  ru: {
    score: ['балл', 'оценк', 'рейтинг', 'счет', 'счёт'],
    drill: ['упражнен', 'трениров', 'план', 'практик'],
    strength: ['сильн', 'хорошо получ'],
    improve: ['улучш', 'слаб', 'поработать', 'фокус'],
    camera: ['камер', 'снима', 'точн', 'как это работает'],
  },
}

export function buildMockChatReply(
  feedback: Feedback,
  metrics: PoseMetrics,
  question: string,
  language: Language = 'en'
): string {
  const q = question.toLowerCase()
  const kw = KEYWORDS[language]
  const has = (words: string[]) => words.some((w) => q.includes(w))

  if (language === 'ru') {
    if (has(kw.score)) {
      const lowest = Object.entries(feedback.scores).sort((a, b) => a[1] - b[1])[0]
      return `Оценки идут напрямую из разбора движения этого ролика — самой низкой в этот раз оказалась «${lowest[0]}» (${lowest[1]}). Это совпадает с «${feedback.improvements[0] ?? 'направлением выше'}». Переснимите после отработки плана тренировок — и увидите изменение.`
    }
    if (has(kw.drill)) {
      const day = feedback.trainingPlan[0]
      const drill = day?.drills[0]
      return drill
        ? `Начните с «${drill.name}» (${day.day}) — ${drill.description} (${drill.duration}). Это упражнение стоит первым, потому что оно нацелено на самое важное направление.`
        : 'Следуйте плану тренировок выше по порядку — он выстроен от самого важного направления к менее срочным.'
    }
    if (has(kw.strength)) {
      return feedback.strengths[0]
        ? `Самая явная сильная сторона на этом ролике: ${feedback.strengths[0]}. Продолжайте закреплять её, одновременно работая над направлениями ниже.`
        : 'Продолжайте отрабатывать базовые элементы — сильные стороны быстрее всего растут за счёт повторения.'
    }
    if (has(kw.improve)) {
      return feedback.improvements[0]
        ? `Сейчас самое важное направление: ${feedback.improvements[0]}. План тренировок выше нацелен на это в первую очередь.`
        : 'Продолжайте следовать плану тренировок выше — он нацелен на самый важный пробел в первую очередь.'
    }
    if (has(kw.camera)) {
      return metrics.source === 'mediapipe'
        ? 'Этот разбор построен на отслеживании позы прямо в браузере на вашем реальном ролике — это общая оценка движения с одной камеры телефона, а не лабораторный захват движения, поэтому воспринимайте категории как тенденции, а не точные измерения.'
        : 'Этот конкретный ролик использовал симулированные демо-данные вместо реального отслеживания позы, так что воспринимайте эти цифры как заглушку — загрузите заново на поддерживаемом устройстве для настоящего разбора.'
    }
    return `${feedback.summary} Спросите меня об оценках, сильных сторонах или плане тренировок для более конкретных ответов.`
  }

  if (has(kw.score)) {
    const lowest = Object.entries(feedback.scores).sort((a, b) => a[1] - b[1])[0]
    return `Scores come straight from the movement read for this clip — ${lowest[0]} was the lowest this time at ${lowest[1]}. That tracks with "${feedback.improvements[0] ?? 'the focus area above'}." Re-film after working the training plan and you'll see it move.`
  }

  if (has(kw.drill)) {
    const day = feedback.trainingPlan[0]
    const drill = day?.drills[0]
    return drill
      ? `Start with "${drill.name}" from ${day.day} — ${drill.description} (${drill.duration}). That one's sequenced first because it targets your biggest focus area.`
      : "Follow the training plan above in order — it's sequenced from your biggest focus area down."
  }

  if (has(kw.strength)) {
    return feedback.strengths[0]
      ? `Clearest strength on this clip: ${feedback.strengths[0]}. Keep reinforcing that while you work the focus areas below.`
      : 'Keep working the fundamentals — strengths build fastest with repetition.'
  }

  if (has(kw.improve)) {
    return feedback.improvements[0]
      ? `Biggest focus area right now: ${feedback.improvements[0]}. The training plan above targets this first.`
      : 'Keep following the training plan above — it targets your biggest gap first.'
  }

  if (has(kw.camera)) {
    return metrics.source === 'mediapipe'
      ? "This read comes from in-browser pose tracking on your actual clip — it's a general movement estimate from a single phone camera, not lab-grade motion capture, so treat the bands as tendencies, not exact measurements."
      : "This particular clip used simulated demo data rather than live pose tracking, so treat these numbers as a placeholder — re-upload on a supported device for a real read."
  }

  return `${feedback.summary} Ask me about your scores, strengths, or the training plan for more specifics.`
}
