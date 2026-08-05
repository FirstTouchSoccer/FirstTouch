'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile, getSession, isDemoMode } from '@/lib/store'
import { PlayerContext } from '@/lib/player-context'
import type { PlayerProfile } from '@/lib/types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [ready, setReady] = useState(false)

  const refreshProfile = useCallback(async () => {
    setProfile(await getProfile())
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const session = await getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      await refreshProfile()
      if (!cancelled) setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [router, refreshProfile])

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <PlayerContext.Provider value={{ profile, refreshProfile }}>
      {isDemoMode && (
        <div className="bg-secondary px-4 py-2 text-center text-[11px] font-medium text-muted-foreground">
          Demo mode — data lives in this browser, not a server.
        </div>
      )}
      {children}
    </PlayerContext.Provider>
  )
}
