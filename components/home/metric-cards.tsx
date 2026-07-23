import { Zap, Crosshair, Gauge, Flame, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Metric = {
  label: string
  value: string
  unit: string
  delta: string
  icon: typeof Zap
  tint: string
}

const metrics: Metric[] = [
  {
    label: 'Top Shot Speed',
    value: '68',
    unit: 'mph',
    delta: '+4 mph',
    icon: Zap,
    tint: 'text-bronze',
  },
  {
    label: 'Passing Accuracy',
    value: '84',
    unit: '%',
    delta: '+6%',
    icon: Crosshair,
    tint: 'text-sage',
  },
  {
    label: 'Max Sprint Speed',
    value: '27.4',
    unit: 'km/h',
    delta: '+1.2',
    icon: Gauge,
    tint: 'text-rose',
  },
  {
    label: 'Active Streak',
    value: '5',
    unit: 'days',
    delta: 'On fire',
    icon: Flame,
    tint: 'text-bronze',
  },
]

export function MetricCards() {
  return (
    <section className="px-5 pt-6" aria-label="Key metrics">
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl bg-secondary',
                    m.tint,
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-sage">
                  <ArrowUpRight className="h-3 w-3" />
                  {m.delta}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight">
                  {m.value}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {m.unit}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.label}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
