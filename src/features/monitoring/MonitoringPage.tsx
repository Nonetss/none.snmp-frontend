import React, { useState } from 'react'
import { Activity, LayoutDashboard, Settings2, RefreshCcw, Bell } from 'lucide-react'
import MonitoringGroupManager from './MonitoringGroupManager'
import PortGroupManager from './PortGroupManager'
import MonitoringRuleManager from './MonitoringRuleManager'
import MonitoringStatusView from './MonitoringStatusView'
import MonitoringNotificationManager from './MonitoringNotificationManager'

type TabId = 'status' | 'config' | 'notifications'

const MonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('status')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Sync with URL hash for persistence
  React.useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabId
    if (hash === 'status' || hash === 'config' || hash === 'notifications') {
      setActiveTab(hash)
    }
  }, [])

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  return (
    <div className="p-4 md:p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full max-w-full 2xl:max-w-[2400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-white" />
            <h1 className="text-xl font-black tracking-[0.3em] uppercase">System.Monitoring</h1>
          </div>
          <p className="text-[10px] text-neutral-500 tracking-widest uppercase">
            Real-time network performance and device health metrics
          </p>
        </div>

        {/* Tabs Control & Global Ops */}
        <div className="flex items-center gap-4">
          {activeTab === 'status' && (
            <div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-1.5 border text-[9px] font-black uppercase transition-all ${
                  autoRefresh
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                    : 'border-white/10 text-neutral-500'
                }`}
              >
                <RefreshCcw className={`w-3 h-3 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
                {autoRefresh ? 'Live_Feed_ON' : 'Live_Feed_OFF'}
              </button>
            </div>
          )}

          <div className="flex p-1 bg-white/5 border border-white/5">
            <button
              onClick={() => handleTabChange('status')}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'status' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Live_Status
            </button>
            <button
              onClick={() => handleTabChange('config')}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'config' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Configuration
            </button>
            <button
              onClick={() => handleTabChange('notifications')}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'notifications'
                  ? 'bg-white text-black'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Alert_Actions
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'status' ? (
        <MonitoringStatusView autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} />
      ) : activeTab === 'notifications' ? (
        <MonitoringNotificationManager />
      ) : (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Monitoring Group Manager Section */}
          <MonitoringGroupManager />

          {/* Port Group Manager Section */}
          <PortGroupManager />

          {/* Monitoring Rule Manager Section */}
          <MonitoringRuleManager />
        </div>
      )}
    </div>
  )
}

export default MonitoringPage
