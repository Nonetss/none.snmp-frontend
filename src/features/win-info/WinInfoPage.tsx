import React, { useState } from 'react'
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

type TabId = 'inventory' | 'search' | 'users' | 'hardware'

const WinInfoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('inventory')

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
            <h1 className="text-xl font-black tracking-[0.3em] uppercase">System.WinInfo</h1>
          </div>
          <p className="text-[10px] text-neutral-500 tracking-widest uppercase">
            Windows Infrastructure Inventory and WMI Management
          </p>
        </div>

        {/* Tabs Control - Industrial Style */}
        <div className="flex p-1 bg-white/5 border border-white/5">
          <button
            onClick={() => handleTabChange('inventory')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-black'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            <AppWindow className="w-3.5 h-3.5" />
            Inventory
          </button>
          <button
            onClick={() => handleTabChange('search')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'search' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
          <button
            onClick={() => handleTabChange('hardware')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'hardware' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Hardware
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'users' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Users
          </button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-1">
              <ComputerApplicationsServicesCard />
            </div>
            <div className="space-y-8">
              <ComputerModelsCard />
              <ComputerDetailsCard />
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ComputerByAppCard />
            <ComputerByServiceCard />
          </div>
        )}

        {activeTab === 'hardware' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ComputerRamCard />
            <ComputerStorageCard />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <UserComputersCard />
              <LastLoginCard />
            </div>
            <LoginHistoryCard />
          </div>
        )}
      </div>
    </div>
  )
}

export default WinInfoPage
