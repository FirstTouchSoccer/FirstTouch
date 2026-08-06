'use client'

import Link from 'next/link'

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
        I confirm I am this player&apos;s parent or legal guardian, or I am the player and I&apos;m 18 or
        older, and I agree to the{' '}
        <Link href="/terms" target="_blank" className="font-semibold text-foreground underline underline-offset-2">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" target="_blank" className="font-semibold text-foreground underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  )
}
