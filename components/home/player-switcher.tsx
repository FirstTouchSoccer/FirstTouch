'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlayers } from '@/lib/players-context'
import { AddPlayerSheet } from '@/components/home/add-player-sheet'

export function PlayerSwitcher() {
  const { players, activePlayer, setActivePlayerId } = usePlayers()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <div className="flex gap-2 overflow-x-auto px-5 pt-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {players.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActivePlayerId(p.id)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
              activePlayer?.id === p.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            {p.name.split(' ')[0] || p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add player
        </button>
      </div>
      {adding && <AddPlayerSheet onClose={() => setAdding(false)} />}
    </>
  )
}
