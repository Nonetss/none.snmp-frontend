import React, { useState, useEffect } from 'react'
import SnmpAuthManager from './SnmpAuthManager'
import KomodoAuthManager from './KomodoAuthManager'
import PangolinAuthManager from './PangolinAuthManager'
import NpmAuthManager from './NpmAuthManager'
import { Shield, Box, ShieldCheck, Server } from 'lucide-react'

type AuthTab = 'snmp' | 'komodo' | 'pangolin' | 'npm'

const AuthManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>('snmp')

  // Sync with URL hash if needed, or just local state
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (['snmp', 'komodo', 'pangolin', 'npm'].includes(hash)) {
      // If we want to support nested hashes, we'd need more logic
      // For now, let's just keep it in state
    }
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Sub-navigation for Auth Types */}
      <div className="flex flex-wrap gap-4 border-b border-white/5 pb-6">
        <button
          onClick={() => setActiveTab('snmp')}
          className={`flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border ${
            activeTab === 'snmp'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-neutral-500 border-white/10 hover:border-white/30 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          SNMP_Auth
        </button>
        <button
          onClick={() => setActiveTab('komodo')}
          className={`flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border ${
            activeTab === 'komodo'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-neutral-500 border-white/10 hover:border-white/30 hover:text-white'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          Komodo_Auth
        </button>
        <button
          onClick={() => setActiveTab('pangolin')}
          className={`flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border ${
            activeTab === 'pangolin'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-neutral-500 border-white/10 hover:border-white/30 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Pangolin_Auth
        </button>
        <button
          onClick={() => setActiveTab('npm')}
          className={`flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border ${
            activeTab === 'npm'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-neutral-500 border-white/10 hover:border-white/30 hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          NPM_Auth
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'snmp' && <SnmpAuthManager />}
        {activeTab === 'komodo' && <KomodoAuthManager />}
        {activeTab === 'pangolin' && <PangolinAuthManager />}
        {activeTab === 'npm' && <NpmAuthManager />}
      </div>
    </div>
  )
}

export default AuthManager
