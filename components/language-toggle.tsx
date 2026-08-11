'use client'

import { Globe } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { LANGUAGES } from '@/lib/i18n/types'
import { cn } from '@/lib/utils'

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useTranslation()

  return (
    <div
      className={cn(
        'flex h-10 items-center gap-1.5 rounded-full border border-border bg-card pl-3 pr-1.5 text-foreground transition-colors duration-200',
        className,
      )}
    >
      <Globe className="h-[15px] w-[15px] shrink-0 text-muted-foreground" aria-hidden="true" />
      <select
        aria-label="Language"
        value={language}
        onChange={(e) => setLanguage(e.target.value as typeof language)}
        className="h-7 cursor-pointer appearance-none rounded-full bg-transparent pr-1 text-xs font-semibold outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  )
}
