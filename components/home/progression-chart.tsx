'use client'

import { useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const ranges = ['7D', '30D', '90D'] as const
type Range = (typeof ranges)[number]

// mock daily "First Touch Precision" scores
const data: Record<Range, number[]> = {
  '7D': [62, 64, 63, 68, 71, 70, 74],
  '30D': [58, 60, 59, 63, 61, 66, 65, 69, 68, 72, 70, 74],
  '90D': [48, 52, 55, 53, 59, 62, 60, 66, 68, 71, 70, 74],
}

const W = 320
const H = 140
const PAD = 12

function buildPath(values: number[]) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const step = (W - PAD * 2) / (values.length - 1)

  const points = values.map((v, i) => {
    const x = PAD + i * step
    const y = PAD + (1 - (v - min) / span) * (H - PAD * 2)
    return [x, y] as const
  })

  // smooth line via catmull-rom -> bezier
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[Math.max(0, i - 1)]
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const [x3, y3] = points[Math.min(points.length - 1, i + 2)]
    const cp1x = x1 + (x2 - x0) / 6
    const cp1y = y1 + (y2 - y0) / 6
    const cp2x = x2 - (x3 - x1) / 6
    const cp2y = y2 - (y3 - y1) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`
  }

  const area = `${d} L ${points[points.length - 1][0]} ${H - PAD} L ${points[0][0]} ${H - PAD} Z`
  return { line: d, area, last: points[points.length - 1] }
}

export function ProgressionChart() {
  const [range, setRange] = useState<Range>('30D')
  const values = data[range]
  const { line, area, last } = useMemo(() => buildPath(values), [values])
  const gain = Math.round(
    ((values[values.length - 1] - values[0]) / values[0]) * 100,
  )

  return (
    <section className="px-5 pt-6" aria-label="Form and progression">
      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Form &amp; Progression</h2>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-sage" />
              <span className="font-semibold text-sage">+{gain}%</span>
              First Touch Precision
            </p>
          </div>
          <div className="flex gap-1 rounded-full bg-secondary p-1">
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
                  range === r
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-36 w-full"
            role="img"
            aria-label={`First touch precision trend over ${range}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--sage)"
                  stopOpacity="0.35"
                />
                <stop
                  offset="100%"
                  stopColor="var(--sage)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((g) => (
              <line
                key={g}
                x1={PAD}
                x2={W - PAD}
                y1={PAD + g * (H - PAD * 2)}
                y2={PAD + g * (H - PAD * 2)}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
            ))}
            <path d={area} fill="url(#areaFill)" />
            <path
              d={line}
              fill="none"
              stroke="var(--sage)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx={last[0]}
              cy={last[1]}
              r="4.5"
              fill="var(--card)"
              stroke="var(--sage)"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
