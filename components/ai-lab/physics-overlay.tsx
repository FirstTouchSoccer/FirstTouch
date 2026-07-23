'use client'

import Image from 'next/image'
import {
  Gauge,
  TrendingUp,
  MoveUp,
  BookmarkPlus,
  BookmarkCheck,
  RotateCcw,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function PhysicsOverlay({
  skill,
  onReset,
}: {
  skill: string
  onReset: () => void
}) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
        <p className="text-xs font-medium text-muted-foreground">
          {skill} · 0:07 clip analyzed
        </p>
      </div>

      {/* Clip with physics overlay */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-charcoal">
        <Image
          src="/overlay-frame.png"
          alt={`${skill} physics analysis`}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw, 448px"
        />

        {/* Launch trajectory arc */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 56"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M28 44 Q 55 6 90 26"
            fill="none"
            stroke="var(--bronze)"
            strokeWidth="0.9"
            strokeDasharray="2.5 1.8"
          />
        </svg>

        {/* Speed readout pinned to ball */}
        <div className="absolute left-[26%] top-[58%]">
          <span className="block h-3 w-3 -translate-x-1/2 rounded-full bg-bronze ring-4 ring-bronze/30" />
        </div>
        <div className="absolute left-[30%] top-[38%] rounded-lg bg-charcoal/85 px-2.5 py-1.5 backdrop-blur-sm">
          <p className="text-[10px] font-medium leading-none text-[color:var(--secondary)]">
            Ball speed
          </p>
          <p className="text-sm font-bold leading-tight text-[color:var(--secondary)]">
            71 mph
          </p>
        </div>

        {/* Angle chip */}
        <div className="absolute right-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-bold text-bronze backdrop-blur-sm">
          Launch 32°
        </div>
      </div>

      {/* Physics stat row */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        {[
          { label: 'Ball speed', value: '71', unit: 'mph', icon: Gauge },
          { label: 'Launch angle', value: '32', unit: '°', icon: TrendingUp },
          { label: 'Peak height', value: '4.2', unit: 'm', icon: MoveUp },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-3 text-center"
            >
              <Icon className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-2 text-lg font-bold leading-none tracking-tight">
                {s.value}
                <span className="text-xs font-medium text-muted-foreground">
                  {s.unit}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {s.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Verdict */}
      <div className="mt-3 rounded-2xl border border-sage/40 bg-sage/10 p-4">
        <p className="text-sm font-semibold text-charcoal">
          Top 12% shot power for your age group
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Contact was clean but slightly under center — aim 2cm higher to add
          spin control.
        </p>
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
              Save to profile
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Analyze another clip
        </button>
      </div>
    </div>
  )
}
