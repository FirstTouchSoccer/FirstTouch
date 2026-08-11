'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'

/**
 * Required on every form that submits a specific child's info (signup, and
 * "+ Add player" later) -- consent is captured per-player, not once for the
 * whole account, since a blanket consent given at signup is weak evidence
 * for a second child added afterward.
 */
export function ConsentCheckbox({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const { t } = useTranslation()

  return (
    <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
      <input
        required
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
      />
      <span>
        {t.auth.consentPrefix}
        <Link href="/terms" target="_blank" className="font-semibold text-foreground underline underline-offset-2">
          {t.auth.termsOfService}
        </Link>
        {t.auth.consentMiddle}
        <Link href="/privacy" target="_blank" className="font-semibold text-foreground underline underline-offset-2">
          {t.auth.privacyPolicy}
        </Link>
        .
      </span>
    </label>
  )
}
