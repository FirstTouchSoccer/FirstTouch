'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)

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
          if (!cancelled) router.replace('/')
          return
        }
        await new Promise((r) => setTimeout(r, 300))
      }
      if (!cancelled) setError('This link has expired or was already used.')
    })()

    return () => {
      cancelled = true
    }
  }, [params, router])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-bold">First Touch</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {error ?? 'Confirming your email…'}
        </p>
        {error && (
          <a href="/signup" className="mt-4 block text-xs font-semibold text-foreground underline underline-offset-2">
            Back to signup
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
