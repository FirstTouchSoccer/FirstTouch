'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle light and dark mode"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors duration-200 active:scale-95',
        className,
      )}
    >
      {mounted && isDark ? (
        <Moon className="h-[18px] w-[18px]" />
      ) : (
        <Sun className="h-[18px] w-[18px]" />
      )}
    </button>
  )
}
