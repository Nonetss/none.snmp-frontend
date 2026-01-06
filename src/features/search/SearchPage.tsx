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
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full pb-20">
      {/* Header Page Title */}
      <div className="max-w-[1400px] mx-auto border-b border-white/10 pb-8 space-y-2 flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-white" />
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            Network.Search_Engine
          </h1>
        </div>
        <p className="text-[11px] text-neutral-400 uppercase tracking-[0.5em]">
          Advanced diagnostics and device localization tools
        </p>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex justify-center gap-1 border-b border-white/10 max-w-[1400px] mx-auto">
        <button
          onClick={() => handleTabChange('general')}
          className={`flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'general'
              ? 'border-white text-white bg-white/5'
              : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Network className="w-4 h-4" />
          Network_Locator
        </button>
        <button
          onClick={() => handleTabChange('applications')}
          className={`flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'applications'
              ? 'border-white text-white bg-white/5'
              : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Box className="w-4 h-4" />
          Applications
        </button>
        <button
          onClick={() => handleTabChange('services')}
          className={`flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'services'
              ? 'border-white text-white bg-white/5'
              : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4" />
          Services
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {activeTab === 'general' && (
          <div className="space-y-12">
            {/* Tool 1: Trace Origin */}

            <section className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">
                  Service_01
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="w-full">
                <ConnectionSearch />
              </div>
            </section>

            {/* Tool 2: Device Identification */}
            <section className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">
                  Service_02
                </span>
                <div className="h-px flex-1 bg-white/5" />
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
