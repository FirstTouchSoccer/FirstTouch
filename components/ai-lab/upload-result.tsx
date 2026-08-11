'use client'

import { CheckCircle2, Clock, RotateCcw } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { tf } from '@/lib/i18n/format'
import type { Clip } from '@/lib/types'

export function UploadResult({ clip, onReset }: { clip: Clip; onReset: () => void }) {
  const { t } = useTranslation()
  const isFullMatch = clip.skillTag === 'full-match'

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col items-center rounded-3xl border border-border bg-card p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/20 text-sage">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold tracking-tight">
          {isFullMatch ? t.aiLab.matchSentToCoach : t.aiLab.clipSaved}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-balance">
          {isFullMatch
            ? t.aiLab.matchSentToCoachBody
            : tf(t.aiLab.clipSavedBody, { title: clip.title })}
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {t.aiLab.turnaround}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground">{t.aiLab.whatHappensNext}</p>
        <ul className="mt-2 flex flex-col gap-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            {t.aiLab.savedInVault}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />{t.aiLab.coachReviews}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            {t.aiLab.seeInCoaches}
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground"
      >
        <RotateCcw className="h-4 w-4" />
        {isFullMatch ? t.aiLab.sendAnotherSession : t.aiLab.analyzeAnother}
      </button>
    </div>
  )
}
