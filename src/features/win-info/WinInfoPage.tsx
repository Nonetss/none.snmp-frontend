import React, { useState, useEffect } from 'react'
import { Laptop, AppWindow, User, Search, Cpu } from 'lucide-react'

import ComputerApplicationsServicesCard from './components/ComputerApplicationsServicesCard'
import ComputerByAppCard from './components/ComputerByAppCard'
import ComputerByServiceCard from './components/ComputerByServiceCard'
import ComputerDetailsCard from './components/ComputerDetailsCard'
import ComputerModelsCard from './components/ComputerModelsCard'
import ComputerRamCard from './components/ComputerRamCard'
import ComputerStorageCard from './components/ComputerStorageCard'
import LastLoginCard from './components/LastLoginCard'
import LoginHistoryCard from './components/LoginHistoryCard'
import UserComputersCard from './components/UserComputersCard'

type TabId = 'search' | 'inventory'

const WinInfoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'search' || hash === 'inventory') {
        return hash as TabId
      }
    }
    return 'search'
  })

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'search' || hash === 'inventory') {
        setActiveTab(hash as TabId)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (window.location.hash.replace('#', '') !== activeTab) {
      window.location.hash = activeTab
    }
  }, [activeTab])

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
  }

  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Laptop className="w-5 h-5 text-white" />
            <h1 className="text-xl font-black tracking-[0.3em] uppercase">System.Win-Info</h1>
          </div>
          <p className="text-[10px] text-neutral-500 tracking-widest uppercase">
            Windows Infrastructure Inventory and WMI Management
          </p>
        </div>

        {/* Tabs Control - Industrial Style */}
        <div className="flex p-1 bg-white/5 border border-white/5">
          <button
            onClick={() => handleTabChange('search')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'search' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search_&_Tools
          </button>
          <button
            onClick={() => handleTabChange('inventory')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-black'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            <AppWindow className="w-3.5 h-3.5" />
            Global_Inventory
          </button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'search' && (
          <div className="space-y-12">
            {/* 01. Node Details */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 opacity-50">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                  01. Node_Discovery_&_WMI
                </span>
                <div className="h-[1px] w-8 bg-white/10" />
              </div>
              <div className="grid grid-cols-1 gap-8">
                <ComputerDetailsCard />
              </div>
            </section>

            {/* 02. Software & Services */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 opacity-50">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                  02. Software_&_Services_Query
                </span>
                <div className="h-[1px] w-8 bg-white/10" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ComputerByAppCard />
                <ComputerByServiceCard />
              </div>
            </section>

            {/* 03. Hardware Specs */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 opacity-50">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                  03. Hardware_Resource_Filters
                </span>
                <div className="h-[1px] w-8 bg-white/10" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ComputerRamCard />
                <ComputerStorageCard />
              </div>
            </section>

            {/* 04. User Activity */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 opacity-50">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                  04. User_Session_Analytics
                </span>
                <div className="h-[1px] w-8 bg-white/10" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UserComputersCard />
                <LastLoginCard />
                <LoginHistoryCard />
              </div>
            </section>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-1">
              <ComputerApplicationsServicesCard />
            </div>
            <div className="space-y-8">
              <ComputerModelsCard />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WinInfoPage
