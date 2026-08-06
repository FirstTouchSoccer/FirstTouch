'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createPlayer } from '@/lib/store'
import { usePlayers } from '@/lib/players-context'
import { emptyPlayerFields, PlayerFieldsForm, type PlayerFieldsValues } from '@/components/player-fields-form'
import { ConsentCheckbox } from '@/components/consent-checkbox'

export function AddPlayerSheet({ onClose }: { onClose: () => void }) {
  const { refreshPlayers, setActivePlayerId } = usePlayers()
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
      await refreshPlayers()
      setActivePlayerId(player.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-charcoal/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-t-3xl border border-border bg-card p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold leading-none tracking-tight">Add a player</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Add another child to your account.</p>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <PlayerFieldsForm values={values} onChange={setValues} />
          <ConsentCheckbox checked={consented} onChange={setConsented} />

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={busy || !consented}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-60"
          >
            Add player
          </button>
        </form>
      </div>
    </div>
  )
}
