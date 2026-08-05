'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import {
  isDemoMode,
  resendVerificationEmail,
  signIn,
  signInWithDemoAccount,
  signUp,
} from '@/lib/store'

export function AuthCard({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const [name, setName] = useState('')
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
        const result = await signUp(email, password, name)
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
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <h1 className="text-lg font-bold leading-none tracking-tight">First Touch</h1>
      </div>

      {isDemoMode && (
        <p className="mt-4 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Demo mode — no backend configured. Any email &amp; password works; your data stays in this browser.
        </p>
      )}

      <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
        {mode === 'signup' && (
          <input
            required
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:border-primary"
          />
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

        {error && <p className="text-xs font-medium text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={busy}
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
    </div>
  )
}
