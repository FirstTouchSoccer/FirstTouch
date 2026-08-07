'use client'

import { useState } from 'react'
import { BottomNav, type TabId } from '@/components/bottom-nav'
import { HomeTab } from '@/components/home/home-tab'
import { VaultTab } from '@/components/vault/vault-tab'
import { AiLabTab } from '@/components/ai-lab/ai-lab-tab'
import { CoachesTab } from '@/components/coaches/coaches-tab'
import { ProfileTab } from '@/components/profile/profile-tab'

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>('home')

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      <main className="flex-1 pb-24 md:pb-0 md:pl-20 lg:pl-64">
        <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-5xl">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'vault' && <VaultTab />}
          {activeTab === 'upload' && <AiLabTab />}
          {activeTab === 'train' && <CoachesTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </div>
      </main>
    </div>
  )
}
