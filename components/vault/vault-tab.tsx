'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Search, Play, Sparkles, ArrowRight, Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  categories,
  videos,
  recommended,
  type Category,
  type Video,
} from '@/components/vault/vault-data'
import { VideoPlayer, type PlayerTarget } from '@/components/vault/video-player'
import { listClips, resolveVideoUrl } from '@/lib/store'
import type { Clip } from '@/lib/types'

export function VaultTab() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Category | 'All'>('All')
  const [selected, setSelected] = useState<PlayerTarget | null>(null)
  const [myClips, setMyClips] = useState<Clip[]>([])

  useEffect(() => {
    listClips().then(setMyClips)
  }, [])

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const matchCat = active === 'All' || v.category === active
      const q = query.trim().toLowerCase()
      const matchQuery =
        q === '' ||
        v.title.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
      return matchCat && matchQuery
    })
  }, [query, active])

  const recVideos = recommended.videoIds
    .map((id) => videos.find((v) => v.id === id))
    .filter(Boolean) as Video[]

  function openCurated(v: Video) {
    setSelected({ title: v.title, thumb: v.thumb, tags: v.tags, videoUrl: null })
  }

  async function openMyClip(clip: Clip) {
    const videoUrl = await resolveVideoUrl(clip)
    setSelected({
      title: clip.title,
      thumb: clip.thumbnailUrl,
      tags: [clip.skillTag.replace(/-/g, ' ')],
      videoUrl,
    })
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <header className="px-5 pt-8">
        <h1 className="text-lg font-bold tracking-tight">Video Vault</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Smart library with AI-tagged clips
        </p>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drills, tactics, #tags"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      {/* Your uploads */}
      {myClips.length > 0 && (
        <section className="px-5 pt-6" aria-label="Your uploads">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your uploads</h2>
            <span className="text-xs text-muted-foreground">{myClips.length}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {myClips.map((clip) => (
              <button
                key={clip.id}
                type="button"
                onClick={() => openMyClip(clip)}
                className="w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-left"
              >
                <div className="relative aspect-video w-full bg-secondary">
                  {clip.thumbnailUrl ? (
                    <Image
                      src={clip.thumbnailUrl}
                      alt={clip.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Film className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-[11px] font-semibold">{clip.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {clip.status === 'sent_to_coach' ? 'Sent to coach' : 'Uploaded'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Category filters */}
      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(['All', ...categories] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              active === c
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* AI recommended playlist */}
      {active === 'All' && query === '' && (
        <section className="px-5 pt-6" aria-label="AI recommended playlist">
          <div className="rounded-2xl border border-primary/30 bg-secondary/60 p-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                AI Recommended Playlist
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-snug text-pretty">
              {recommended.reason}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              3 clips picked to fix this weakness
            </p>

            <div className="mt-3 flex flex-col gap-2">
              {recVideos.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => openCurated(v)}
                  className="flex items-center gap-3 rounded-xl bg-card p-2 text-left"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={v.thumb}
                      alt={v.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{v.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {v.duration}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Library grid */}
      <section className="px-5 pb-4 pt-6" aria-label="Video library">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {active === 'All' ? 'All videos' : active}
          </h2>
          <span className="text-xs text-muted-foreground">
            {filtered.length} clips
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-12 text-center">
            <p className="text-sm font-medium">No clips found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => openCurated(v)}
                className="overflow-hidden rounded-2xl border border-border bg-card text-left"
              >
                <div className="relative aspect-video w-full">
                  <Image
                    src={v.thumb}
                    alt={v.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 448px) 100vw, 448px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                  <span className="absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full bg-card/90">
                    <Play className="h-5 w-5 translate-x-0.5 fill-current text-foreground" />
                  </span>
                  <span className="absolute bottom-2 right-2 rounded-md bg-charcoal/80 px-1.5 py-0.5 text-[11px] font-medium text-[color:var(--secondary)]">
                    {v.duration}
                  </span>
                  <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold text-primary backdrop-blur-sm">
                    {v.category}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold leading-snug text-pretty">
                    {v.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {v.views} views
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {v.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <VideoPlayer target={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
