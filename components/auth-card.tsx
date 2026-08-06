'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  isDemoMode,
  resendVerificationEmail,
  signIn,
  signInWithDemoAccount,
  signUp,
} from '@/lib/store'
import { emptyPlayerFields, PlayerFieldsForm, type PlayerFieldsValues } from '@/components/player-fields-form'
import { ConsentCheckbox } from '@/components/consent-checkbox'

export function AuthCard({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
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
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function continueAsDemo() {
    setBusy(true)
    setError(null)
    try {
      await signInWithDemoAccount()
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the demo account.')
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
        <h1 className="text-lg font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="font-medium text-foreground">{pendingEmail}</span>.
          Click it to finish signing up.
        </p>
        <button
          type="button"
          onClick={resend}
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
        >
          {resent ? 'Sent again' : 'Resend email'}
        </button>
        <Link href="/signup" className="mt-4 block text-xs text-muted-foreground underline underline-offset-2">
          Back to signup
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6">
      <h1 className="text-lg font-bold leading-none tracking-tight">
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {mode === 'signup'
          ? "Parents/guardians create the account and can add their kids' player profiles."
          : 'Log in to see your progress and coach feedback.'}
      </p>

      {isDemoMode && (
        <p className="mt-4 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Demo mode — no backend configured. Any email &amp; password works; your data stays in this browser.
        </p>
      )}

      <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
        {mode === 'signup' && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your info</p>
            <div className="flex gap-3">
              <input
                required
                type="text"
                placeholder="Your first name"
                value={accountFirstName}
                onChange={(e) => setAccountFirstName(e.target.value)}
                className="w-1/2 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
              />
              <input
                required
                type="text"
                placeholder="Your last name"
                value={accountLastName}
                onChange={(e) => setAccountLastName(e.target.value)}
                className="w-1/2 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
              />
            </div>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Add your player
            </p>
            <PlayerFieldsForm values={player} onChange={setPlayer} />
          </>
        )}
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
        />
        <input
          required
          type="password"
          placeholder="Password"
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
          {mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
      </form>

      {mode === 'login' && (
        <button
          type="button"
          onClick={continueAsDemo}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          Continue with demo account
        </button>
      )}

      <p className="mt-5 text-center text-xs text-muted-foreground">
        {mode === 'signup' ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-foreground underline underline-offset-2">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link href="/signup" className="font-semibold text-foreground underline underline-offset-2">
              Create an account
            </Link>
          </>
        )}
      </p>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        <Link href="/terms" className="underline underline-offset-2">
          Terms of Service
        </Link>{' '}
        ·{' '}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
