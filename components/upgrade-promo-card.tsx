'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { startCheckout } from '@/lib/store'
import { useTranslation } from '@/lib/i18n/context'

/**
 * A soft Pro upsell for a specific spot in the app. The account-wide gate
 * (isEntitled, demo mode) lives in each call site, not here, so a caller
 * that forgets to gate it fails loudly in review rather than this component
 * silently no-op'ing.
 */
export function UpgradePromoCard({ headline, body }: { headline: string; body: string }) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)

  async function upgrade() {
    setBusy(true)
    try {
      window.location.href = await startCheckout()
    } catch {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-secondary/60 p-4">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
          {t.billing.proBadge}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-snug text-pretty">{headline}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
      <button
        type="button"
        onClick={upgrade}
        disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        <Sparkles className="h-4 w-4" />
        {busy ? t.aiLab.redirecting : t.upgradePromo.cta}
      </button>
    </div>
  )
}
