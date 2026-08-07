import Image from 'next/image'

/**
 * Old default avatar path, kept only so already-created players (before this
 * component existed) still get the initials fallback instead of the old
 * stock photo — no migration needed.
 */
const LEGACY_PLACEHOLDER = '/player-avatar.png'

/**
 * Renders into a `relative` sized container exactly like `<Image fill>` did
 * before it — a real photo if the player has one, otherwise a plain
 * initial-letter avatar instead of a stock photo that looks like fake demo
 * data on a brand-new real account.
 */
export function PlayerAvatar({ name, avatarUrl, sizePx }: { name: string; avatarUrl: string; sizePx: number }) {
  const hasRealPhoto = avatarUrl && avatarUrl !== LEGACY_PLACEHOLDER

  if (hasRealPhoto) {
    return <Image src={avatarUrl} alt={name} fill className="object-cover" sizes={`${sizePx}px`} />
  }

  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-primary font-bold text-primary-foreground"
      style={{ fontSize: sizePx * 0.4 }}
      aria-hidden
    >
      {initial}
    </div>
  )
}
