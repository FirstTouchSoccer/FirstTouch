'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Boxes,
  Flame,
  Spline,
  BookmarkPlus,
  BookmarkCheck,
  RotateCcw,
  Footprints,
  Crosshair,
  Timer,
  Gauge,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type OverlayMode = 'boxes' | 'heatmap' | 'trajectory'

const overlays: { id: OverlayMode; label: string; icon: typeof Boxes }[] = [
  { id: 'boxes', label: 'Bounding boxes', icon: Boxes },
  { id: 'heatmap', label: 'Heatmap', icon: Flame },
  { id: 'trajectory', label: 'Trajectory', icon: Spline },
]

const metrics = [
  { label: 'Touch count', value: '312', icon: Footprints, tint: 'text-bronze' },
  { label: 'Passing accuracy', value: '84%', icon: Crosshair, tint: 'text-sage' },
  { label: 'Reaction speed', value: '0.34s', icon: Timer, tint: 'text-rose' },
  { label: 'Speed rating', value: '88', icon: Gauge, tint: 'text-bronze' },
]

export function AnalysisDashboard({ onReset }: { onReset: () => void }) {
  const [overlay, setOverlay] = useState<OverlayMode>('boxes')
  const [saved, setSaved] = useState(false)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Visual overlay mock */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative aspect-video w-full bg-charcoal">
          <Image
            src="/overlay-frame.png"
            alt="AI analyzed match frame"
            fill
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
          />

          {/* Bounding boxes */}
          {overlay === 'boxes' && (
            <div className="absolute inset-0">
              <div className="absolute left-[38%] top-[30%] h-[42%] w-[16%] rounded-md border-2 border-sage">
                <span className="absolute -top-5 left-0 rounded bg-sage px-1.5 py-0.5 text-[9px] font-bold text-sage-foreground">
                  Player 0.98
                </span>
              </div>
              <div className="absolute left-[56%] top-[62%] h-[9%] w-[7%] rounded-full border-2 border-bronze">
                <span className="absolute -top-5 left-0 rounded bg-bronze px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                  Ball
                </span>
              </div>
            </div>
          )}

          {/* Heatmap */}
          {overlay === 'heatmap' && (
            <div className="absolute inset-0">
              <div className="absolute left-[30%] top-[40%] h-40 w-40 -translate-x-1/2 rounded-full bg-rose/50 blur-2xl" />
              <div className="absolute left-[48%] top-[55%] h-28 w-28 -translate-x-1/2 rounded-full bg-bronze/50 blur-2xl" />
              <div className="absolute left-[65%] top-[35%] h-20 w-20 -translate-x-1/2 rounded-full bg-sage/40 blur-2xl" />
            </div>
          )}

          {/* Trajectory */}
          {overlay === 'trajectory' && (
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 56"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M20 46 Q 40 10 62 40 T 92 20"
                fill="none"
                stroke="var(--bronze)"
                strokeWidth="0.8"
                strokeDasharray="2 1.5"
              />
              <circle cx="20" cy="46" r="1.6" fill="var(--sage)" />
              <circle cx="62" cy="40" r="1.6" fill="var(--sage)" />
              <circle cx="92" cy="20" r="1.6" fill="var(--rose)" />
            </svg>
          )}

          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-bold text-sage backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            AI overlay
          </div>
        </div>

        {/* Overlay switcher */}
        <div className="flex items-center gap-2 p-3">
          {overlays.map((o) => {
            const Icon = o.icon
            const active = overlay === o.id
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setOverlay(o.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="truncate">{o.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Deep metrics */}
      <h3 className="mb-3 mt-6 text-sm font-semibold">Deep metrics</h3>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl bg-secondary',
                  m.tint,
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight">
                {m.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.label}</p>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setSaved(true)}
          disabled={saved}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-colors',
            saved
              ? 'bg-sage text-sage-foreground'
              : 'bg-primary text-primary-foreground active:scale-[0.99]',
          )}
        >
          {saved ? (
            <>
              <BookmarkCheck className="h-4 w-4" />
              Saved to your profile
            </>
          ) : (
            <>
              <BookmarkPlus className="h-4 w-4" />
              Save insights to profile
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Analyze another
        </button>
      </div>
    </div>
  )
}
