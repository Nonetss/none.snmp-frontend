import React, { useState, useEffect } from 'react'
import AuthManager from '@/features/settings/AuthManager'
import SubnetManager from '@/features/settings/SubnetManager'
import TaskScheduler from '@/features/settings/TaskScheduler'
import TagManager from '@/features/settings/TagManager'
import NotificationCredentialManager from '@/features/settings/NotificationCredentialManager'
import NotificationTopicManager from '@/features/settings/NotificationTopicManager'
import { Shield, Network, Calendar, Tag, Bell, Key } from 'lucide-react'

type TabId = 'auth' | 'subnets' | 'scheduler' | 'tags' | 'notifications'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('subnets')

  // Sync with URL hash for persistence
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabId
    if (
      hash === 'auth' ||
      hash === 'subnets' ||
      hash === 'scheduler' ||
      hash === 'tags' ||
      hash === 'notifications'
    ) {
      setActiveTab(hash)
    }
  }, [])

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full">
      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-white/10 max-w-[1200px] mx-auto">
        <button
          onClick={() => handleTabChange('subnets')}
          className={`flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'subnets'
              ? 'border-white text-white bg-white/5'
              : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Network className="w-4 h-4" />
          Subnet_Inventory
        </button>
        <button
          onClick={() => handleTabChange('tags')}
          className={`flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'tags'
              ? 'border-white text-white bg-white/5'
              : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Tag className="w-4 h-4" />
          Device_Tags
        </button>
        <button
          onClick={() => handleTabChange('notifications')}
          className={`flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'notifications'
              ? 'border-white text-white bg-white/5'
              : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>
        <button
          onClick={() => handleTabChange('auth')}
          className={`flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'auth'
              ? 'border-white text-white bg-white/5'
              : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Key className="w-4 h-4" />
          Auth
        </button>
        <button
          onClick={() => handleTabChange('scheduler')}
          className={`flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'scheduler'
              ? 'border-white text-white bg-white/5'
              : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Task_Scheduler
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto">
        {activeTab === 'subnets' && <SubnetManager />}
        {activeTab === 'tags' && <TagManager />}
        {activeTab === 'notifications' && (
          <div className="space-y-12">
            <NotificationCredentialManager />
            <NotificationTopicManager />
          </div>
        )}
        {activeTab === 'auth' && <AuthManager />}
        {activeTab === 'scheduler' && <TaskScheduler />}
      </div>
    </div>
  )
}

export default SettingsPage
