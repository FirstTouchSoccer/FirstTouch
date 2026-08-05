'use client'

import { useMemo } from 'react'
import { Hexagon } from 'lucide-react'
import { usePlayer } from '@/lib/player-context'

const SIZE = 260
const CENTER = SIZE / 2
const RADIUS = 92
const MAX = 99
const RINGS = [0.25, 0.5, 0.75, 1]

const ATTRIBUTE_META = [
  { key: 'pace', label: 'Pace', short: 'PAC' },
  { key: 'shooting', label: 'Shooting', short: 'SHO' },
  { key: 'dribbling', label: 'Dribbling', short: 'DRI' },
  { key: 'passing', label: 'Passing', short: 'PAS' },
  { key: 'physicality', label: 'Physicality', short: 'PHY' },
] as const

function pointAt(index: number, count: number, radius: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

function polygon(count: number, radius: number) {
  return Array.from({ length: count }, (_, i) => {
    const p = pointAt(i, count, radius)
    return `${p.x},${p.y}`
  }).join(' ')
}

export function SkillRadar() {
  const { profile } = usePlayer()

  const attributes = useMemo(
    () =>
      profile
        ? ATTRIBUTE_META.map((m) => ({ ...m, value: profile.attributes[m.key] }))
        : [],
    [profile],
  )
  const count = attributes.length

  const dataPoints = useMemo(
    () =>
      attributes
        .map((a, i) => {
          const p = pointAt(i, count, (a.value / MAX) * RADIUS)
          return `${p.x},${p.y}`
        })
        .join(' '),
    [attributes, count],
  )

  if (!profile || count === 0) return null

  const average = Math.round(
    attributes.reduce((sum, a) => sum + a.value, 0) / count,
  )

  return (
    <section className="px-5 pt-6" aria-label="Skill radar chart">
      <div className="rounded-3xl border border-border bg-card p-5 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hexagon className="h-4 w-4 text-sage" />
            <h2 className="text-sm font-semibold">Skill Radar</h2>
          </div>
          <div className="flex items-baseline gap-1 rounded-full bg-secondary px-3 py-1">
            <span className="text-sm font-bold text-foreground">{average}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              avg
            </span>
          </div>
        </div>

        <div className="mt-2 flex justify-center">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="h-[260px] w-[260px]"
            role="img"
            aria-label="Radar chart of Pace, Shooting, Dribbling, Passing and Physicality"
          >
            {/* grid rings */}
            {RINGS.map((r) => (
              <polygon
                key={r}
                points={polygon(count, RADIUS * r)}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
              />
            ))}

            {/* axes */}
            {attributes.map((a, i) => {
              const p = pointAt(i, count, RADIUS)
              return (
                <line
                  key={a.key}
                  x1={CENTER}
                  y1={CENTER}
                  x2={p.x}
                  y2={p.y}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              )
            })}

            {/* data polygon */}
            <polygon
              points={dataPoints}
              fill="var(--sage)"
              fillOpacity="0.28"
              stroke="var(--sage)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* data vertices */}
            {attributes.map((a, i) => {
              const p = pointAt(i, count, (a.value / MAX) * RADIUS)
              return (
                <circle
                  key={a.key}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="var(--card)"
                  stroke="var(--sage)"
                  strokeWidth="2.5"
                />
              )
            })}

            {/* axis labels */}
            {attributes.map((a, i) => {
              const p = pointAt(i, count, RADIUS + 20)
              return (
                <text
                  key={a.key}
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-[color:var(--muted-foreground)] text-[9px] font-bold uppercase tracking-wider"
                >
                  {a.short}
                </text>
              )
            })}
          </svg>
        </div>

        {/* attribute legend */}
        <ul className="mt-2 grid grid-cols-1 gap-1.5">
          {attributes.map((a) => (
            <li key={a.key} className="flex items-center gap-3">
              <span className="w-20 text-xs font-medium text-muted-foreground">
                {a.label}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <span
                  className="block h-full rounded-full bg-sage"
                  style={{ width: `${a.value}%` }}
                />
              </span>
              <span className="w-6 text-right text-xs font-bold tabular-nums">
                {a.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
