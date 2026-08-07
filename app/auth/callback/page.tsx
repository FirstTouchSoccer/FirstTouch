'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/logo'

function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const errorDescription = params.get('error_description')
    if (errorDescription) {
      setError(errorDescription.replace(/\+/g, ' '))
      return
    }

    if (!supabase) {
      router.replace('/login')
      return
    }

    ;(async () => {
      const code = params.get('code')
      if (code) {
        const { error: exchangeError } = await supabase!.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          if (!cancelled) setError(exchangeError.message)
          return
        }
      }

      for (let attempt = 0; attempt < 10; attempt++) {
        const { data } = await supabase!.auth.getSession()
        if (data.session) {
          if (cancelled) return
          // Show a clear success state for a beat before redirecting —
          // jumping straight to '/' made a working confirmation look like a
          // blank/broken page to real users, who reported it as "empty."
          setConfirmed(true)
          setTimeout(() => {
            if (!cancelled) router.replace('/')
          }, 1400)
          return
        }
        await new Promise((r) => setTimeout(r, 300))
      }
      if (!cancelled) {
        setError(
          "This link has expired or was already used. If your email app scans links automatically, your account may already be confirmed — try logging in directly."
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [params, router])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-6">
      <Logo size="lg" />
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {error ?? (confirmed ? "You're confirmed! Taking you in…" : 'Confirming your email…')}
        </p>
        {error && (
          <a href="/login" className="mt-4 block text-xs font-semibold text-foreground underline underline-offset-2">
            Go to login
          </a>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  )
}
