'use client'

import { useState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/lib/store'
import { useTranslation } from '@/lib/i18n/context'

export function ForgotPasswordCard() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await requestPasswordReset(email)
      setSentTo(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong)
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    if (!sentTo || busy) return
    setBusy(true)
    setError(null)
    try {
      await requestPasswordReset(sentTo)
      setResent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong)
    } finally {
      setBusy(false)
    }
  }

  if (sentTo) {
    return (
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-bold">{t.forgotPassword.checkEmailTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.forgotPassword.checkEmailBody.split('{email}')[0]}
          <span className="font-medium text-foreground">{sentTo}</span>
          {t.forgotPassword.checkEmailBody.split('{email}')[1]}
        </p>
        <button
          type="button"
          onClick={resend}
          disabled={busy}
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {resent ? t.forgotPassword.resentEmail : t.forgotPassword.resendEmail}
        </button>
        {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
        <Link href="/login" className="mt-4 block text-xs text-muted-foreground underline underline-offset-2">
          {t.forgotPassword.backToLogin}
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6">
      <h1 className="text-lg font-bold leading-none tracking-tight">{t.forgotPassword.title}</h1>
      <p className="mt-1.5 text-xs text-muted-foreground">{t.forgotPassword.subtitle}</p>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
        <input
          required
          type="email"
          placeholder={t.forgotPassword.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
        />

        {error && <p className="text-xs font-medium text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-60"
        >
          {t.forgotPassword.submitBtn}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-5 block text-center text-xs text-muted-foreground underline underline-offset-2"
      >
        {t.forgotPassword.backToLogin}
      </Link>
    </div>
  )
}
