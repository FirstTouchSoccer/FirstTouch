'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  steps: string[]
  onComplete: () => void
  stepMs?: number
  title?: string
  /** When provided, the loader reflects real progress instead of a fixed timer. */
  activeStep?: number
}

export function AiLoader({
  steps,
  onComplete,
  stepMs = 1100,
  title = 'Saving your clip',
  activeStep,
}: Props) {
  const [internalActive, setInternalActive] = useState(0)
  const controlled = activeStep !== undefined
  const active = controlled ? activeStep : internalActive

  useEffect(() => {
    if (controlled) return
    if (internalActive >= steps.length) {
      const t = setTimeout(onComplete, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setInternalActive((a) => a + 1), stepMs)
    return () => clearTimeout(t)
  }, [controlled, internalActive, steps.length, stepMs, onComplete])

  const pct = Math.min(100, Math.round((active / steps.length) * 100))

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">
            First Touch · {pct}% complete
          </p>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {steps.map((step, i) => {
          const done = i < active
          const current = i === active
          return (
            <li
              key={step}
              className={cn(
                'flex items-center gap-3 text-sm transition-opacity',
                done || current ? 'opacity-100' : 'opacity-40',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                  done && 'border-sage bg-sage text-sage-foreground',
                  current && 'border-primary text-primary',
                  !done && !current && 'border-border text-muted-foreground',
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : current ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span className="text-[11px] font-semibold">{i + 1}</span>
                )}
              </span>
              <span
                className={cn(
                  'font-medium',
                  current ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
