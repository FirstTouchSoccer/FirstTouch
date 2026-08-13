'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { updatePassword } from '@/lib/store'
import { Logo } from '@/components/logo'
import { useTranslation } from '@/lib/i18n/context'

type Phase = 'confirming' | 'ready' | 'success' | 'error'

function ResetPasswordInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { t } = useTranslation()
  const [phase, setPhase] = useState<Phase>('confirming')
  const [error, setError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Deliberately does NOT accept "a session already exists" as proof of a
  // real recovery link -- someone with an already-authenticated device could
  // otherwise open this URL directly and change the account's password
  // without ever touching the emailed link. A `code` param can only come
  // from a genuine, single-use, server-issued reset link, and the hash-based
  // flow is confirmed only via Supabase's dedicated PASSWORD_RECOVERY auth
  // event, which fires solely when it parses a recovery token from the URL.
  useEffect(() => {
    let cancelled = false

    const errorDescription = params.get('error_description')
    if (errorDescription) {
      setError(errorDescription.replace(/\+/g, ' '))
      setPhase('error')
      return
    }

    if (!supabase) {
      router.replace('/login')
      return
    }

    const code = params.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        if (cancelled) return
        if (exchangeError) {
          setError(exchangeError.message)
          setPhase('error')
        } else {
          setPhase('ready')
        }
      })
      return () => {
        cancelled = true
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && !cancelled) {
        clearTimeout(timeout)
        setPhase('ready')
      }
    })

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setError(t.resetPassword.expiredLinkError)
        setPhase('error')
      }
    }, 4000)

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [params, router, t])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (newPassword.length < 8) {
      setFormError(t.resetPassword.tooShortError)
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError(t.resetPassword.mismatchError)
      return
    }
    setBusy(true)
    try {
      await updatePassword(newPassword)
      setPhase('success')
      setTimeout(() => router.replace('/home'), 1400)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.common.somethingWentWrong)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-6">
      <Logo size="lg" />

      {phase === 'confirming' && (
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">{t.resetPassword.confirmingLink}</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <a
            href="/forgot-password"
            className="mt-4 block text-xs font-semibold text-foreground underline underline-offset-2"
          >
            {t.resetPassword.goToForgotPassword}
          </a>
        </div>
      )}

      {phase === 'success' && (
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center">
          <h1 className="text-lg font-bold">{t.resetPassword.successTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.resetPassword.successBody}</p>
        </div>
      )}

      {phase === 'ready' && (
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6">
          <h1 className="text-lg font-bold leading-none tracking-tight">{t.resetPassword.title}</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">{t.resetPassword.subtitle}</p>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
            <input
              required
              type="password"
              placeholder={t.resetPassword.newPasswordPlaceholder}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
            />
            <input
              required
              type="password"
              placeholder={t.resetPassword.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
            />

            {formError && <p className="text-xs font-medium text-destructive">{formError}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-60"
            >
              {t.resetPassword.submitBtn}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  )
}
