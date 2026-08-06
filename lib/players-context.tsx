'use client'

import { createContext, useContext } from 'react'
import type { Player } from '@/lib/types'

export interface PlayersCtx {
  players: Player[]
  activePlayer: Player | null
  setActivePlayerId: (id: string) => void
  refreshPlayers: () => Promise<void>
}

export const PlayersContext = createContext<PlayersCtx>({
  players: [],
  activePlayer: null,
  setActivePlayerId: () => {},
  refreshPlayers: async () => {},
})

export function usePlayers(): PlayersCtx {
  return useContext(PlayersContext)
}
