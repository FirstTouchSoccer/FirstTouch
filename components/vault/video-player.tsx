'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Rewind,
  Gauge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Video } from '@/components/vault/vault-data'

const speeds = [0.25, 0.5, 1, 1.5, 2]

export function VideoPlayer({
  video,
  onClose,
}: {
  video: Video
  onClose: () => void
}) {
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [frame, setFrame] = useState(42)

  return (
    <div
      className="fixed inset-0 z-[60] mx-auto flex w-full max-w-md flex-col bg-background animate-in slide-in-from-bottom duration-300"
      role="dialog"
      aria-label={`Player: ${video.title}`}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="truncate pr-4 text-sm font-semibold">{video.title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close player"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Video surface */}
        <div className="relative aspect-video w-full bg-charcoal">
          <Image
            src={video.thumb}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
          />
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/40">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card/90">
                <Play className="h-6 w-6 translate-x-0.5 fill-current text-foreground" />
              </span>
            </div>
          )}
          <div className="absolute right-3 top-3 rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-bold text-bronze backdrop-blur-sm">
            {speed}x
          </div>
          <div className="absolute bottom-3 left-3 rounded-md bg-charcoal/80 px-2 py-1 font-mono text-[11px] text-[color:var(--secondary)]">
            Frame {frame} / 90
          </div>
        </div>

        {/* Scrubber */}
        <div className="px-5 pt-4">
          <div className="relative h-1.5 w-full rounded-full bg-secondary">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${(frame / 90) * 100}%` }}
            />
            <span
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/20"
              style={{ left: `${(frame / 90) * 100}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>0:0{Math.floor(frame / 30)}</span>
            <span>{video.duration}</span>
          </div>
        </div>

        {/* Transport controls */}
        <div className="mt-4 flex items-center justify-center gap-3 px-5">
          <button
            type="button"
            aria-label="Previous frame"
            onClick={() => setFrame((f) => Math.max(0, f - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Rewind"
            onClick={() => setFrame((f) => Math.max(0, f - 10))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <Rewind className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={() => setPlaying((p) => !p)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            {playing ? (
              <Pause className="h-6 w-6 fill-current" />
            ) : (
              <Play className="h-6 w-6 translate-x-0.5 fill-current" />
            )}
          </button>
          <button
            type="button"
            aria-label="Forward"
            onClick={() => setFrame((f) => Math.min(90, f + 10))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <Rewind className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Next frame"
            onClick={() => setFrame((f) => Math.min(90, f + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Playback speed */}
        <div className="mt-6 px-5">
          <div className="mb-2 flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground">
              Playback speed
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {speeds.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={cn(
                  'rounded-xl py-2 text-xs font-semibold transition-colors',
                  speed === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground',
                )}
              >
                {s}x
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {speed <= 0.5
              ? 'Slow-motion enabled · step frame-by-frame with the skip controls'
              : 'Use skip controls to step frame-by-frame'}
          </p>
        </div>

        {/* AI tags */}
        <div className="mt-6 px-5">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            AI metadata
          </p>
          <div className="flex flex-wrap gap-2">
            {video.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
