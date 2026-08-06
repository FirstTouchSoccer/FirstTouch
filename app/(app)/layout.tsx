'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPlayer, getSession, isDemoMode, listPlayers } from '@/lib/store'
import { PlayersContext } from '@/lib/players-context'
import { emptyPlayerFields, PlayerFieldsForm, type PlayerFieldsValues } from '@/components/player-fields-form'
import { ConsentCheckbox } from '@/components/consent-checkbox'
import { Logo } from '@/components/logo'
import type { Player } from '@/lib/types'

function activePlayerStorageKey(userId: string): string {
  return `ft_active_player:${userId}`
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [activePlayerId, setActivePlayerIdState] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const refreshPlayersList = useCallback(async () => {
    const list = await listPlayers()
    setPlayers(list)
    return list
  }, [])

  const refreshPlayers = useCallback(async () => {
    await refreshPlayersList()
  }, [refreshPlayersList])

  const setActivePlayerId = useCallback(
    (id: string) => {
      setActivePlayerIdState(id)
      if (userId) localStorage.setItem(activePlayerStorageKey(userId), id)
    },
    [userId]
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const session = await getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      const list = await refreshPlayersList()
      if (cancelled) return
      setUserId(session.userId)
      const savedId = localStorage.getItem(activePlayerStorageKey(session.userId))
      const initial = list.find((p) => p.id === savedId) ?? list[0] ?? null
      if (initial) setActivePlayerIdState(initial.id)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [router, refreshPlayersList])

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  // Edge case: a signed-in account with zero players (e.g. signup was
  // interrupted before the player row could be created and there was no
  // metadata to recover it from). Recover inline rather than a dead-end route.
  if (players.length === 0) {
    return (
      <RecoverPlayerScreen
        onCreated={async (player) => {
          setPlayers([player])
          setActivePlayerId(player.id)
        }}
      />
    )
  }

  const activePlayer = players.find((p) => p.id === activePlayerId) ?? players[0]

  return (
    <PlayersContext.Provider value={{ players, activePlayer, setActivePlayerId, refreshPlayers }}>
      {isDemoMode && (
        <div className="bg-secondary px-4 py-2 text-center text-[11px] font-medium text-muted-foreground">
          Demo mode — data lives in this browser, not a server.
        </div>
      )}
      {children}
    </PlayersContext.Provider>
  )
}

function RecoverPlayerScreen({ onCreated }: { onCreated: (player: Player) => void }) {
  const [values, setValues] = useState<PlayerFieldsValues>(emptyPlayerFields)
  const [consented, setConsented] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!consented) return
    setBusy(true)
    setError(null)
    try {
      const player = await createPlayer({
        name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
        age: values.age ? Number(values.age) : null,
        experience: values.experience,
        consentedAt: new Date().toISOString(),
      })
      onCreated(player)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-6">
      <Logo size="lg" />
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6">
        <h1 className="text-lg font-bold leading-none tracking-tight">Add your player</h1>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Your account doesn&apos;t have a player set up yet — add one to continue.
        </p>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <PlayerFieldsForm values={values} onChange={setValues} />
          <ConsentCheckbox checked={consented} onChange={setConsented} />
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy || !consented}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-60"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
