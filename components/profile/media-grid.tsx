'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Award, Dumbbell, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  mediaFilters,
  mediaItems,
  type MediaKind,
} from '@/components/profile/profile-data'
import { useTranslation } from '@/lib/i18n/context'

const kindIcon = {
  clip: Play,
  drill: Dumbbell,
  badge: Award,
}

export function MediaGrid() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<MediaKind | 'all'>('all')

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? mediaItems
        : mediaItems.filter((m) => m.kind === filter),
    [filter],
  )

  return (
    <section className="px-5 pt-8" aria-label="Personal media gallery">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t.profile.mediaGallery}</h2>
        <span className="text-xs font-medium text-muted-foreground">
          {t.profile.items(mediaItems.length)}
        </span>
      </div>

      {/* filters */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mediaFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* instagram-style grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {filtered.map((m) => {
          const Icon = kindIcon[m.kind]
          return (
            <button
              key={m.id}
              type="button"
              aria-label={m.title}
              className="group relative aspect-square overflow-hidden rounded-xl bg-secondary"
            >
              <Image
                src={m.thumb}
                alt={m.title}
                fill
                className="object-cover transition-transform duration-200 group-active:scale-105"
                sizes="(max-width: 448px) 33vw, 150px"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/10 to-transparent" />
              <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-card/85 text-foreground backdrop-blur-sm">
                <Icon className="h-3 w-3" />
              </span>
              <span className="absolute inset-x-1.5 bottom-1.5 text-left">
                <span className="line-clamp-1 text-[10px] font-bold leading-tight text-[color:var(--secondary)]">
                  {m.title}
                </span>
                <span className="line-clamp-1 text-[9px] text-white/70">
                  {m.meta}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
