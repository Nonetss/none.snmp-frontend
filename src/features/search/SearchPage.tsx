import React, { useState, useEffect } from 'react'
import ConnectionSearch from '@/features/search/ConnectionSearch'
import DeviceIdentify from '@/features/search/DeviceIdentify'
import ApplicationSearch from '@/features/search/ApplicationSearch'
import ServiceSearch from '@/features/search/ServiceSearch'
import { Search, Network, Box, Zap } from 'lucide-react'

type SearchTab = 'general' | 'applications' | 'services'

const SearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SearchTab>('general')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as SearchTab
    if (['general', 'applications', 'services'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [])

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  return (
    <div className="p-4 md:p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-white" />
            <h1 className="text-xl font-black tracking-[0.3em] uppercase">System.Search-Engine</h1>
          </div>
          <p className="text-[10px] text-neutral-500 tracking-widest uppercase">
            Advanced diagnostics and device localization tools
          </p>
        </div>

        {/* Tabs Control - Industrial Style */}
        <div className="flex p-1 bg-white/5 border border-white/5">
          <button
            onClick={() => handleTabChange('general')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'general' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Network_Locator
          </button>
          <button
            onClick={() => handleTabChange('applications')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'applications'
                ? 'bg-white text-black'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Applications
          </button>
          <button
            onClick={() => handleTabChange('services')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'services' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Services
          </button>
        </div>
      </div>

      <div className="max-w-full 2xl:max-w-[2000px] mx-auto">
        {activeTab === 'general' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Tool 1: Trace Origin */}
            <section className="space-y-4 max-w-full 2xl:max-w-7xl mx-auto">
              <div className="flex items-center gap-2 opacity-50">
                <div className="h-[1px] w-8 bg-white/10" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                  01. Path_Trace_&_Origin
                </span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>
              <div className="w-full">
                <ConnectionSearch />
              </div>
            </section>

            {/* Tool 2: Device Identification */}
            <section className="space-y-4 max-w-full 2xl:max-w-7xl mx-auto">
              <div className="flex items-center gap-2 opacity-50">
                <div className="h-[1px] w-8 bg-white/10" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                  02. Identity_Resolution
                </span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>
              <div className="w-full">
                <DeviceIdentify />
              </div>
            </section>
          </div>
        )}

        {activeTab === 'applications' && <ApplicationSearch />}

        {activeTab === 'services' && <ServiceSearch />}
      </div>
    </div>
  )
}

export default SearchPage
