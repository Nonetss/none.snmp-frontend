import React, { useState, useEffect } from 'react'
import SnmpAuthManager from '@/features/settings/SnmpAuthManager'
import SubnetManager from '@/features/settings/SubnetManager'
import { Shield, Network } from 'lucide-react'

type TabId = 'snmp' | 'subnets'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('snmp')

  // Sync with URL if needed or just use state
  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full">
      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-white/10 max-w-[1200px] mx-auto">
        <button
          onClick={() => setActiveTab('snmp')}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'snmp'
              ? 'border-white text-white bg-white/5'
              : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          SNMP_Auth
        </button>
        <button
          onClick={() => setActiveTab('subnets')}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'subnets'
              ? 'border-white text-white bg-white/5'
              : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Network className="w-4 h-4" />
          Subnet_Inventory
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto">
        {activeTab === 'snmp' && <SnmpAuthManager />}
        {activeTab === 'subnets' && <SubnetManager />}
      </div>
    </div>
  )
}

export default SettingsPage
