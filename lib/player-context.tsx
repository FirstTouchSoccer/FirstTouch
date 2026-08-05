'use client'

import { createContext, useContext } from 'react'
import type { PlayerProfile } from '@/lib/types'

export interface PlayerCtx {
  profile: PlayerProfile | null
  refreshProfile: () => Promise<void>
}

export const PlayerContext = createContext<PlayerCtx>({
  profile: null,
  refreshProfile: async () => {},
})

export function usePlayer(): PlayerCtx {
  return useContext(PlayerContext)
}
