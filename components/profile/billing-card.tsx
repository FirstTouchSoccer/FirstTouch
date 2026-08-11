'use client'

import { useState } from 'react'
import { CreditCard, Sparkles } from 'lucide-react'
import { isDemoMode, openBillingPortal, startCheckout } from '@/lib/store'
import { usePlayers } from '@/lib/players-context'
import { useTranslation } from '@/lib/i18n/context'
import { tf } from '@/lib/i18n/format'

/**
 * Account-wide, unlike the rest of this player-scoped tab — one subscription
 * covers every player under the account, so this card says so explicitly
 * rather than implying it's tied to whichever player is currently active.
 */
export function BillingCard() {
  const { billing } = usePlayers()
  const { t, language } = useTranslation()
  const locale = language === 'ru' ? 'ru-RU' : 'en-US'
  const [busy, setBusy] = useState(false)

  async function upgrade() {
    setBusy(true)
    try {
      window.location.href = await startCheckout()
    } catch {
      setBusy(false)
    }
  }

  async function manageBilling() {
    setBusy(true)
    try {
      window.location.href = await openBillingPortal()
    } catch {
      setBusy(false)
    }
  }

  return (
    <section className="px-5 pt-8" aria-label="Billing">
      <div className="rounded-3xl border border-border bg-card p-5 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-primary">
            <CreditCard className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold leading-none">{t.billing.title}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{t.billing.subtitle}</p>
          </div>
        </div>

        {isDemoMode ? (
          <p className="mt-4 text-xs text-muted-foreground">
            {t.billing.demoNote}
          </p>
        ) : billing.isEntitled ? (
          <>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-[color:var(--sage)] px-2.5 py-0.5 text-[10px] font-bold text-[color:var(--sage-foreground)]">
                {t.billing.proBadge}
              </span>
              {billing.currentPeriodEnd && (
                <span className="text-[11px] text-muted-foreground">
                  {tf(t.billing.renews, {
                    date: new Date(billing.currentPeriodEnd).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
                  })}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={manageBilling}
              disabled={busy}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-40"
            >
              {busy ? t.aiLab.redirecting : t.billing.manageBilling}
            </button>
          </>
        ) : (
          <>
            <p className="mt-4 text-xs text-muted-foreground">
              {tf(t.billing.freePlan, { used: billing.freeAnalysesUsed, limit: billing.freeAnalysesLimit })}
            </p>
            <button
              type="button"
              onClick={upgrade}
              disabled={busy}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              {busy ? t.aiLab.redirecting : t.billing.upgradeToPro}
            </button>
          </>
        )}
      </div>
    </section>
  )
}
