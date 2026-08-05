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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      <main className="flex-1 pb-24">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'vault' && <VaultTab />}
        {activeTab === 'upload' && <AiLabTab />}
        {activeTab === 'train' && <CoachesTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}
