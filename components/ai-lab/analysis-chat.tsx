'use client'

import { useState } from 'react'
import { MessageCircle, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authToken, updateClip } from '@/lib/store'
import { buildMockChatReply, MAX_CHAT_TURNS } from '@/lib/mock-chat'
import { useTranslation } from '@/lib/i18n/context'
import { tf } from '@/lib/i18n/format'
import type { ChatMessage, Clip, Player } from '@/lib/types'

export function AnalysisChat({
  clip,
  profile,
  onClipUpdate,
}: {
  clip: Clip
  profile: Player
  onClipUpdate: (clip: Clip) => void
}) {
  const { t, language } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>(clip.chat ?? [])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [monthlyCapReached, setMonthlyCapReached] = useState(false)

  if (!clip.metrics || !clip.feedback) return null

  const questionsUsed = messages.filter((m) => m.role === 'user').length
  const atCap = questionsUsed >= MAX_CHAT_TURNS || monthlyCapReached

  async function send() {
    const question = input.trim()
    if (!question || sending || atCap || !clip.metrics || !clip.feedback) return

    const userMsg: ChatMessage = { role: 'user', content: question, createdAt: new Date().toISOString() }
    const withUser = [...messages, userMsg]
    setMessages(withUser)
    setInput('')
    setSending(true)

    let replyText: string
    try {
      const token = await authToken()
      const res = await fetch('/api/feedback/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          profile: {
            name: profile.name,
            age: profile.age,
            experience: profile.experience,
            position: profile.position,
            attributes: profile.attributes,
          },
          metrics: clip.metrics,
          feedback: clip.feedback,
          clipTitle: clip.title,
          history: messages,
          question,
          language,
        }),
      })
      if (res.status === 429) {
        const data = await res.json().catch(() => null)
        if (data?.error === 'chat_monthly_cap_reached') {
          // Account-wide monthly cap, not the per-clip MAX_CHAT_TURNS one —
          // don't fabricate a coach reply for this, just stop and explain.
          setMonthlyCapReached(true)
          setSending(false)
          return
        }
      }
      const data = await res.json()
      replyText = res.ok ? data.reply : buildMockChatReply(clip.feedback, clip.metrics, question, language)
    } catch {
      replyText = buildMockChatReply(clip.feedback, clip.metrics, question, language)
    }

    const assistantMsg: ChatMessage = { role: 'assistant', content: replyText, createdAt: new Date().toISOString() }
    const final = [...withUser, assistantMsg]
    setMessages(final)
    setSending(false)
    await updateClip(clip.id, { chat: final })
    onClipUpdate({ ...clip, chat: final })
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <MessageCircle className="h-3.5 w-3.5 text-primary" />
        {t.aiLab.askAnything}
      </p>

      {messages.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                m.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'mr-auto bg-secondary/70 text-foreground',
              )}
            >
              {m.content}
            </div>
          ))}
          {sending && (
            <div className="mr-auto flex items-center gap-1.5 rounded-2xl bg-secondary/70 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t.common.loading}
            </div>
          )}
        </div>
      )}

      {atCap ? (
        <p className="mt-3 text-[11px] text-muted-foreground">
          {monthlyCapReached ? t.aiLab.chatMonthlyCapReached : tf(t.aiLab.chatCapReached, { max: MAX_CHAT_TURNS })}
        </p>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            placeholder={t.aiLab.chatPlaceholder}
            disabled={sending}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary disabled:opacity-60"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
      {!atCap && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          {tf(t.aiLab.chatUsedCount, { used: questionsUsed, max: MAX_CHAT_TURNS })}
        </p>
      )}
    </div>
  )
}
