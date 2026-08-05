'use client'

import Image from 'next/image'
import { X, Play } from 'lucide-react'

export type PlayerTarget = {
  title: string
  thumb?: string
  tags?: string[]
  videoUrl?: string | null
}

export function VideoPlayer({
  target,
  onClose,
}: {
  target: PlayerTarget
  onClose: () => void
}) {
  const { title, thumb, tags = [], videoUrl } = target

  return (
    <div
      className="fixed inset-0 z-[60] mx-auto flex w-full max-w-md flex-col bg-background animate-in slide-in-from-bottom duration-300"
      role="dialog"
      aria-label={`Player: ${title}`}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="truncate pr-4 text-sm font-semibold">{title}</p>
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
        <div className="relative aspect-video w-full bg-charcoal">
          {videoUrl ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={videoUrl}
              controls
              autoPlay
              className="h-full w-full object-cover"
            />
          ) : thumb ? (
            <>
              <Image
                src={thumb}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 448px) 100vw, 448px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/40">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card/90">
                  <Play className="h-6 w-6 translate-x-0.5 fill-current text-foreground" />
                </span>
              </div>
              <p className="absolute bottom-3 left-3 rounded-md bg-charcoal/80 px-2 py-1 text-[11px] text-[color:var(--secondary)]">
                Preview only — no video file for this sample
              </p>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No preview available
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className="mt-6 px-5">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              AI metadata
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
