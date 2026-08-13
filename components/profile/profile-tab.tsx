import { ProfileHeader } from '@/components/profile/profile-header'
import { SkillRadar } from '@/components/profile/skill-radar'
import { MediaGrid } from '@/components/profile/media-grid'
import { ActivityHistory } from '@/components/profile/activity-history'
import { BillingCard } from '@/components/profile/billing-card'

export function ProfileTab() {
  return (
    <div className="animate-in fade-in duration-500">
      <ProfileHeader />
      <BillingCard />
      <SkillRadar />
      <MediaGrid />
      <ActivityHistory />
    </div>
  )
}
