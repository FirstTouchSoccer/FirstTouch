import { PlayerHeader } from '@/components/home/player-header'
import { PlayerSwitcher } from '@/components/home/player-switcher'
import { MetricCards } from '@/components/home/metric-cards'
import { ProgressionChart } from '@/components/home/progression-chart'
import { GoalBenchmarks } from '@/components/home/goal-benchmarks'
import { ActivityFeed } from '@/components/home/activity-feed'
import { UpgradePromoCard } from '@/components/upgrade-promo-card'
import { isDemoMode } from '@/lib/store'
import { usePlayers } from '@/lib/players-context'
import { useTranslation } from '@/lib/i18n/context'

export function HomeTab() {
  const { billing } = usePlayers()
  const { t } = useTranslation()
  return (
    <div className="animate-in fade-in duration-500">
      <PlayerSwitcher />
      <PlayerHeader />
      <MetricCards />
      {!isDemoMode && !billing.isEntitled && (
        <section className="px-5 pt-6" aria-label="Upgrade to Pro">
          <UpgradePromoCard headline={t.upgradePromo.homeHeadline} body={t.upgradePromo.homeBody} />
        </section>
      )}
      <ProgressionChart />
      <GoalBenchmarks />
      <ActivityFeed />
    </div>
  )
}
