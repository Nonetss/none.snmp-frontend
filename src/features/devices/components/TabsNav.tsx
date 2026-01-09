import React from 'react'
import {
  LayoutDashboard,
  Network,
  Activity,
  MapPin,
  Box,
  List,
  Cpu,
  Camera,
  Radio,
} from 'lucide-react'
import type { TabId } from '@/features/devices/components/types'

interface TabsNavProps {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  hasHikvision?: boolean
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, setActiveTab, hasHikvision }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interfaces', label: 'Interfaces', icon: Network },

    { id: 'network', label: 'Network & Routes', icon: Activity },
    { id: 'bridge', label: 'Bridge', icon: Box },
    { id: 'discovery', label: 'Discovery', icon: MapPin },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'services', label: 'Services', icon: List },
    { id: 'applications', label: 'Applications', icon: Cpu },
    ...(hasHikvision ? [{ id: 'hikvision', label: 'Hikvision', icon: Camera }] : []),
  ] as const

  return (
    <div className="bg-black/40 border-b border-white/5 overflow-x-auto no-scrollbar">
      <div className="flex px-8 max-w-[1800px] mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`flex items-center gap-2 px-6 py-4 text-[10px] uppercase font-bold tracking-widest transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-white text-white bg-white/5'
                : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
            }`}
          >
            <tab.icon
              className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : 'text-neutral-600'}`}
            />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
