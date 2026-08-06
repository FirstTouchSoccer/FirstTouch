'use client'

import { TrendingUp, TrendingDown, Dumbbell, RotateCcw, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { movementReads, type Band } from '@/lib/read'
import { AnalysisChat } from '@/components/ai-lab/analysis-chat'
import type { Clip, Player } from '@/lib/types'

const bandStyle: Record<Band, string> = {
  Developing: 'bg-secondary text-muted-foreground',
  Solid: 'bg-sage/20 text-sage',
  Strong: 'bg-sage text-sage-foreground',
}

export function AnalysisResult({
  clip,
  profile,
  onReset,
  onClipUpdate,
}: {
  clip: Clip
  profile: Player
  onReset: () => void
  onClipUpdate: (clip: Clip) => void
}) {
  const { metrics, feedback } = clip
  if (!metrics || !feedback) return null

  const reads = movementReads(metrics)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Movement read */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground">Movement read</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {reads.map((r) => (
            <div key={r.key} className="rounded-xl bg-secondary/60 p-3">
              <p className="text-[11px] font-medium text-muted-foreground">{r.label}</p>
              <span
                className={cn(
                  'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold',
                  bandStyle[r.band],
                )}
              >
                {r.band}
              </span>
            </div>
          ))}
        </div>
        {metrics.source === 'simulated' && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Info className="h-3 w-3 shrink-0" />
            Simulated demo data — real pose tracking runs automatically on supported devices
          </p>
        )}
      </div>

      {/* Coach summary */}
      <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-xs font-semibold text-primary">
          {feedback.source === 'claude' ? 'AI Coach Summary' : 'AI Coach Summary (preview)'}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">{feedback.summary}</p>
        {feedback.source === 'mock' && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Preview feedback generated from your real movement data. Full AI coaching
            activates once the app&apos;s Anthropic key is connected.
          </p>
        )}
      </div>

      {/* Strengths / improvements */}
      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-sage">
            <TrendingUp className="h-3.5 w-3.5" /> Strengths
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {feedback.strengths.map((s) => (
              <li key={s} className="text-xs leading-relaxed text-foreground">
                • {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-bronze">
            <TrendingDown className="h-3.5 w-3.5" /> Focus areas
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {feedback.improvements.map((s) => (
              <li key={s} className="text-xs leading-relaxed text-foreground">
                • {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Scores */}
      <div className="mt-4 grid grid-cols-5 gap-2">
        {Object.entries(feedback.scores).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-border bg-card p-2 text-center">
            <p className="text-sm font-bold">{value}</p>
            <p className="mt-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
              {key}
            </p>
          </div>
        ))}
      </div>

      {/* Training plan */}
      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Dumbbell className="h-4 w-4 text-primary" /> Training plan
        </p>
        <div className="flex flex-col gap-2">
          {feedback.trainingPlan.map((day) => (
            <div key={day.day} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-primary">{day.day}</p>
                <p className="text-xs text-muted-foreground">{day.focus}</p>
              </div>
              <ul className="mt-2 flex flex-col gap-2">
                {day.drills.map((d) => (
                  <li key={d.name} className="rounded-xl bg-secondary/60 p-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">{d.name}</p>
                      <span className="text-[10px] text-muted-foreground">{d.duration}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {d.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <AnalysisChat clip={clip} profile={profile} onClipUpdate={onClipUpdate} />

      <p className="mt-4 text-center text-[11px] text-muted-foreground text-balance">
        This is AI-generated feedback, not a human coach&apos;s review. A real coach may
        still leave notes on this clip separately.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground"
      >
        <RotateCcw className="h-4 w-4" />
        Analyze another clip
      </button>
    </div>
  )
}
