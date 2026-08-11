'use client'

import { Home, Clapperboard, Plus, Target, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/context'
import type { Dictionary } from '@/lib/i18n/types'

export type TabId = 'home' | 'vault' | 'upload' | 'train' | 'profile'

const items: {
  id: TabId
  labelKey: keyof Dictionary['nav']
  icon: typeof Home
}[] = [
  { id: 'home', labelKey: 'home', icon: Home },
  { id: 'vault', labelKey: 'vault', icon: Clapperboard },
  { id: 'upload', labelKey: 'upload', icon: Plus },
  { id: 'train', labelKey: 'train', icon: Target },
  { id: 'profile', labelKey: 'profile', icon: User },
]

export function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: TabId
  onChange: (tab: TabId) => void
}) {
  const { t } = useTranslation()
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-border bg-card/90 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:top-0 md:right-auto md:w-20 md:max-w-none md:border-t-0 md:border-r md:px-3 md:pb-0 md:pt-6 lg:w-64"
    >
      <ul className="flex items-stretch justify-between md:flex-col md:items-stretch md:justify-start md:gap-1.5">
        {items.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          if (item.id === 'upload') {
            return (
              <li key={item.id} className="flex flex-1 justify-center md:flex-none md:justify-start">
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  aria-label={t.nav.uploadClipAria}
                  className="-mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95 md:mt-0 md:h-12 md:w-full md:rounded-xl"
                >
                  <Icon className="h-6 w-6" strokeWidth={2.5} />
                  <span className="hidden lg:ml-2 lg:inline">{t.nav.upload}</span>
                </button>
              </li>
            )
          }

          return (
            <li key={item.id} className="flex flex-1 md:flex-none">
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors md:flex-row md:justify-center md:gap-2.5 md:rounded-xl md:py-2.5 md:text-sm lg:justify-start lg:px-3',
                  isActive ? 'text-foreground md:bg-secondary' : 'text-muted-foreground',
                )}
              >
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="md:hidden lg:inline">{t.nav[item.labelKey]}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
