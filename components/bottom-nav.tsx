'use client'

import { Home, Clapperboard, Plus, Target, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabId = 'home' | 'vault' | 'upload' | 'train' | 'profile'

const items: {
  id: TabId
  label: string
  icon: typeof Home
}[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'vault', label: 'Vault', icon: Clapperboard },
  { id: 'upload', label: 'Upload', icon: Plus },
  { id: 'train', label: 'Train', icon: Target },
  { id: 'profile', label: 'Profile', icon: User },
]

export function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: TabId
  onChange: (tab: TabId) => void
}) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-border bg-card/90 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="flex items-stretch justify-between">
        {items.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          if (item.id === 'upload') {
            return (
              <li key={item.id} className="flex flex-1 justify-center">
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  aria-label="Upload a clip"
                  className="-mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
                >
                  <Icon className="h-6 w-6" strokeWidth={2.5} />
                </button>
              </li>
            )
          }

          return (
            <li key={item.id} className="flex flex-1">
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
