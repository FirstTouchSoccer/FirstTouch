import { Footprints, Rocket, Brain, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Goal = {
  title: string
  detail: string
  icon: typeof Rocket
  current: number
  target: number
  progress: number
  done?: boolean
}

const goals: Goal[] = [
  {
    title: 'Right-Foot Touches',
    detail: '38 / 50 completed',
    icon: Footprints,
    current: 38,
    target: 50,
    progress: 76,
  },
  {
    title: 'Power Target',
    detail: 'Hit >65 mph in Single-Skill Mode',
    icon: Rocket,
    current: 1,
    target: 1,
    progress: 100,
    done: true,
  },
  {
    title: 'Tactical Mastery',
    detail: 'Watch 2 positioning clips',
    icon: Brain,
    current: 1,
    target: 2,
    progress: 50,
  },
]

export function GoalBenchmarks() {
  return (
    <section className="px-5 pt-8" aria-label="AI goal benchmarks">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">AI Goal Benchmarks</h2>
        <span className="text-xs font-medium text-muted-foreground">
          This week
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {goals.map((g) => {
          const Icon = g.icon
          return (
            <div
              key={g.title}
              className={cn(
                'rounded-2xl border p-4',
                g.done
                  ? 'border-sage/40 bg-sage/10'
                  : 'border-border bg-card',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    g.done
                      ? 'bg-sage text-sage-foreground'
                      : 'bg-secondary text-primary',
                  )}
                >
                  {g.done ? (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {g.title}
                    </p>
                    <span
                      className={cn(
                        'shrink-0 text-xs font-bold',
                        g.done ? 'text-sage' : 'text-muted-foreground',
                      )}
                    >
                      {g.done ? 'Goal met' : `${g.progress}%`}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {g.detail}
                  </p>
                </div>
              </div>

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'h-full rounded-full',
                    g.done ? 'bg-sage' : 'bg-primary',
                  )}
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
