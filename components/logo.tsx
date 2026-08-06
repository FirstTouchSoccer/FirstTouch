import { cn } from '@/lib/utils'

/**
 * Ring + pentagon mark. The ring and accent pentagon stay the fixed brand
 * green (--brand) in both themes; the center pentagon uses currentColor so
 * it inherits text color and flips light/dark automatically.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="192.2 34"
        transform="rotate(200 50 50)"
      />
      <polygon points="50,35 66.17,46.75 59.99,65.75 40.01,65.75 33.83,46.75" fill="currentColor" />
      <polygon points="75.98,15.71 83.45,24.01 77.86,33.68 66.94,31.36 65.77,20.25" fill="var(--brand)" />
    </svg>
  )
}

const markSizes = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-12 w-12' }
const textSizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-3xl' }

export function Logo({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2 text-foreground', className)}>
      <LogoMark className={markSizes[size]} />
      <span className={cn('font-extrabold tracking-tight', textSizes[size])}>
        First<span style={{ color: 'var(--brand)' }}>Touch</span>
      </span>
    </div>
  )
}
