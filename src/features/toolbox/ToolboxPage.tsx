import React, { useState, useEffect } from 'react'
import { Wrench, Zap, Search, Activity, Network, Database } from 'lucide-react'
import PingTool from './components/PingTool'
import TracerouteTool from './components/TracerouteTool'
import DnsTool from './components/DnsTool'
import TcpTool from './components/TcpTool'

type ToolId = 'ping' | 'traceroute' | 'dns' | 'tcp'

const ToolboxPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolId>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as ToolId
      if (['ping', 'traceroute', 'dns', 'tcp'].includes(hash)) {
        return hash
      }
    }
    return 'ping'
  })

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ToolId
      if (['ping', 'traceroute', 'dns', 'tcp'].includes(hash)) {
        setActiveTab(hash)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleTabChange = (tab: ToolId) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  const tools = [
    { id: 'ping' as ToolId, name: 'ICMP_Ping', icon: Activity },
    { id: 'traceroute' as ToolId, name: 'Traceroute', icon: Network },
    { id: 'dns' as ToolId, name: 'DNS_Query', icon: Database },
    { id: 'tcp' as ToolId, name: 'TCP_Ports', icon: Zap },
  ]

  return (
    <div className="p-4 md:p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-white" />
            <h1 className="text-xl font-black tracking-[0.3em] uppercase">System.Toolbox</h1>
          </div>
          <p className="text-[10px] text-neutral-500 tracking-widest uppercase">
            Network Diagnostic Utilities and Tactical Tools
          </p>
        </div>

        {/* Tabs Control - Industrial Style */}
        <div className="flex p-1 bg-white/5 border border-white/5 overflow-x-auto no-scrollbar">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleTabChange(tool.id)}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tool.id ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
              }`}
            >
              <tool.icon className="w-3.5 h-3.5" />
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-full 2xl:max-w-[2000px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'ping' && (
          <section className="space-y-4 max-w-full 2xl:max-w-7xl">
            <div className="flex items-center gap-2 opacity-50">
              <div className="h-[1px] w-8 bg-white/10" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                Tool_01 // ICMP_Diagnostics
              </span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            <PingTool />
          </section>
        )}

        {activeTab === 'traceroute' && (
          <section className="space-y-4 max-w-full 2xl:max-w-7xl">
            <div className="flex items-center gap-2 opacity-50">
              <div className="h-[1px] w-8 bg-white/10" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                Tool_02 // Path_Discovery
              </span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            <TracerouteTool />
          </section>
        )}

        {activeTab === 'dns' && (
          <section className="space-y-4 max-w-full 2xl:max-w-7xl">
            <div className="flex items-center gap-2 opacity-50">
              <div className="h-[1px] w-8 bg-white/10" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                Tool_03 // DNS_Resolver
              </span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            <DnsTool />
          </section>
        )}

        {activeTab === 'tcp' && (
          <section className="space-y-4 max-w-full 2xl:max-w-7xl">
            <div className="flex items-center gap-2 opacity-50">
              <div className="h-[1px] w-8 bg-white/10" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                Tool_04 // TCP_Diagnostics
              </span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            <TcpTool />
          </section>
        )}
      </div>
    </div>
  )
}

export default ToolboxPage
