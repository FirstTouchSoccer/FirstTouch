'use client'

import { createContext, useContext } from 'react'
import type { BillingStatus, Player } from '@/lib/types'

const DEFAULT_BILLING: BillingStatus = {
  subscriptionStatus: 'none',
  isEntitled: false,
  freeAnalysesUsed: 0,
  freeAnalysesLimit: 2,
  currentPeriodEnd: null,
}

export interface PlayersCtx {
  players: Player[]
  activePlayer: Player | null
  setActivePlayerId: (id: string) => void
  refreshPlayers: () => Promise<void>
  billing: BillingStatus
  refreshBilling: () => Promise<void>
}

export const PlayersContext = createContext<PlayersCtx>({
  players: [],
  activePlayer: null,
  setActivePlayerId: () => {},
  refreshPlayers: async () => {},
  billing: DEFAULT_BILLING,
  refreshBilling: async () => {},
})

export function usePlayers(): PlayersCtx {
  return useContext(PlayersContext)
}
