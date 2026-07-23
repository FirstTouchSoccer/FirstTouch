import { PlayerHeader } from '@/components/home/player-header'
import { MetricCards } from '@/components/home/metric-cards'
import { ProgressionChart } from '@/components/home/progression-chart'
import { GoalBenchmarks } from '@/components/home/goal-benchmarks'
import { ActivityFeed } from '@/components/home/activity-feed'

export function HomeTab() {
  return (
    <div className="animate-in fade-in duration-500">
      <PlayerHeader />
      <MetricCards />
      <ProgressionChart />
      <GoalBenchmarks />
      <ActivityFeed />
    </div>
  )
}
