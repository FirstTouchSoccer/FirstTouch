'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  isDemoMode,
  resendVerificationEmail,
  signIn,
  signInWithDemoAccount,
  signUp,
} from '@/lib/store'
import { emptyPlayerFields, PlayerFieldsForm, type PlayerFieldsValues } from '@/components/player-fields-form'
import { ConsentCheckbox } from '@/components/consent-checkbox'
import { useTranslation } from '@/lib/i18n/context'

export function AuthCard({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const { t } = useTranslation()
  const [accountFirstName, setAccountFirstName] = useState('')
  const [accountLastName, setAccountLastName] = useState('')
  const [player, setPlayer] = useState<PlayerFieldsValues>(emptyPlayerFields)
  const [consented, setConsented] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  // While this tab is showing "Check your email," the actual confirmation
  // usually happens in a different tab (the email link opens its own tab).
  // Supabase's client syncs auth state across same-origin tabs via a
  // `storage` event, so onAuthStateChange fires here the moment that other
  // tab confirms — no manual refresh needed. Polling is a fallback in case
  // that cross-tab sync doesn't fire in some browser (e.g. strict private-
  // browsing storage partitioning).
  useEffect(() => {
    if (!pendingEmail || !supabase) return
    let cancelled = false

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !cancelled) router.push('/home')
    })

    const poll = setInterval(async () => {
      const { data } = await supabase!.auth.getSession()
      if (data.session && !cancelled) router.push('/home')
    }, 3000)

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
      clearInterval(poll)
    }
  }, [pendingEmail, router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'signup') {
        if (!consented) return
        const accountName = `${accountFirstName.trim()} ${accountLastName.trim()}`.trim()
        const playerName = `${player.firstName.trim()} ${player.lastName.trim()}`.trim()
        const result = await signUp(
          email,
          password,
          accountName,
          playerName,
          player.age ? Number(player.age) : null,
          player.experience,
          new Date().toISOString()
        )
        if (result.status === 'verification_required') {
          setPendingEmail(result.email)
          return
        }
      } else {
        await signIn(email, password)
      }
      router.push('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong)
    } finally {
      setBusy(false)
    }
  }

  async function continueAsDemo() {
    setBusy(true)
    setError(null)
    try {
      await signInWithDemoAccount()
      router.push('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.demoStartError)
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    if (!pendingEmail) return
    await resendVerificationEmail(pendingEmail)
    setResent(true)
  }

  if (pendingEmail) {
    return (
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-bold">{t.auth.checkEmailTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.auth.checkEmailBody.split('{email}')[0]}
          <span className="font-medium text-foreground">{pendingEmail}</span>
          {t.auth.checkEmailBody.split('{email}')[1]}
        </p>
        <button
          type="button"
          onClick={resend}
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
        >
          {resent ? t.auth.resentEmail : t.auth.resendEmail}
        </button>
        <Link href="/signup" className="mt-4 block text-xs text-muted-foreground underline underline-offset-2">
          {t.auth.backToSignup}
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6">
      <h1 className="text-lg font-bold leading-none tracking-tight">
        {mode === 'signup' ? t.auth.signupTitle : t.auth.loginTitle}
      </h1>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {mode === 'signup' ? t.auth.signupSubtitle : t.auth.loginSubtitle}
      </p>

      <p className="mt-2 text-xs text-muted-foreground">
        {mode === 'signup' ? (
          <>
            {t.auth.alreadyHaveAccount}{' '}
            <Link href="/login" className="font-semibold text-foreground underline underline-offset-2">
              {t.common.logIn}
            </Link>
          </>
        ) : (
          <>
            {t.auth.newHere}{' '}
            <Link href="/signup" className="font-semibold text-foreground underline underline-offset-2">
              {t.auth.createAccount}
            </Link>
          </>
        )}
      </p>

      {isDemoMode && (
        <p className="mt-4 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
          {t.auth.demoModeNote}
        </p>
      )}

      <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
        {mode === 'signup' && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.auth.yourInfo}</p>
            <div className="flex gap-3">
              <input
                required
                type="text"
                placeholder={t.auth.firstName}
                value={accountFirstName}
                onChange={(e) => setAccountFirstName(e.target.value)}
                className="w-1/2 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
              />
              <input
                required
                type="text"
                placeholder={t.auth.lastName}
                value={accountLastName}
                onChange={(e) => setAccountLastName(e.target.value)}
                className="w-1/2 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
              />
            </div>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.auth.addYourPlayer}
            </p>
            <PlayerFieldsForm values={player} onChange={setPlayer} />
          </>
        )}
        <input
          required
          type="email"
          placeholder={t.auth.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
        />
        <input
          required
          type="password"
          placeholder={t.auth.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
        />

        {mode === 'signup' && <ConsentCheckbox checked={consented} onChange={setConsented} />}

        {error && <p className="text-xs font-medium text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={busy || (mode === 'signup' && !consented)}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-60"
        >
          {mode === 'signup' ? t.auth.createAccountBtn : t.auth.logInBtn}
        </button>
      </form>

      {mode === 'login' && (
        <button
          type="button"
          onClick={continueAsDemo}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          {t.auth.continueWithDemo}
        </button>
      )}

      <p className="mt-5 text-center text-[11px] text-muted-foreground">
        <Link href="/terms" className="underline underline-offset-2">
          {t.auth.termsOfService}
        </Link>{' '}
        ·{' '}
        <Link href="/privacy" className="underline underline-offset-2">
          {t.auth.privacyPolicy}
        </Link>
      </p>
    </div>
  )
}
