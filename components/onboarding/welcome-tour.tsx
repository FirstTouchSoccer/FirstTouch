'use client'

import { useEffect, useState } from 'react'
import { X, Camera, UploadCloud, MessageSquareText } from 'lucide-react'
import { usePlayers } from '@/lib/players-context'
import { useTranslation } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

const SEEN_KEY = 'ft_onboarding_seen_v1'
const TOTAL_STEPS = 4

export function WelcomeTour({ onAddPhoto }: { onAddPhoto: () => void }) {
  const { t } = useTranslation()
  const { activePlayer } = usePlayers()
  const [step, setStep] = useState(1)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!activePlayer) return
    if (!localStorage.getItem(SEEN_KEY)) setVisible(true)
  }, [activePlayer?.id])

  function dismiss() {
    localStorage.setItem(SEEN_KEY, '1')
    setVisible(false)
  }

  function handleAddPhoto() {
    dismiss()
    onAddPhoto()
  }

  if (!visible || !activePlayer) return null

  const firstName = activePlayer.name.trim().split(' ')[0] || activePlayer.name

  const steps = [
    { title: t.onboarding.step1Title, body: t.onboarding.step1Body, icon: null },
    { title: t.onboarding.step2Title, body: t.onboarding.step2Body(firstName), icon: Camera },
    { title: t.onboarding.step3Title, body: t.onboarding.step3Body, icon: UploadCloud },
    { title: t.onboarding.step4Title, body: t.onboarding.step4Body, icon: MessageSquareText },
  ]
  const current = steps[step - 1]
  const Icon = current.icon

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-charcoal/50 sm:items-center"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-t-3xl border border-border bg-card p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            {t.onboarding.stepOf(step, TOTAL_STEPS)}
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t.onboarding.skip}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn('h-1 flex-1 rounded-full', i < step ? 'bg-primary' : 'bg-secondary')}
            />
          ))}
        </div>

        {Icon && (
          <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Icon className="h-6 w-6" />
          </div>
        )}

        <h2 className={cn('font-bold tracking-tight', Icon ? 'mt-4 text-lg' : 'mt-5 text-xl')}>
          {current.title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{current.body}</p>

        {step === 2 ? (
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleAddPhoto}
              className="rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99]"
            >
              {t.onboarding.step2Cta}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground active:scale-[0.99]"
              >
                {t.onboarding.back}
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-muted-foreground active:scale-[0.99]"
              >
                {t.onboarding.next}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground active:scale-[0.99]"
              >
                {t.onboarding.back}
              </button>
            )}
            <button
              type="button"
              onClick={() => (step < TOTAL_STEPS ? setStep((s) => s + 1) : dismiss())}
              className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground active:scale-[0.99]"
            >
              {step < TOTAL_STEPS ? t.onboarding.next : t.onboarding.getStarted}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
