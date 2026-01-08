import React from 'react'
import { Activity, Terminal } from 'lucide-react'
import MonitoringGroupManager from './MonitoringGroupManager'

const MonitoringPage: React.FC = () => {
  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-white" />
          <h1 className="text-xl font-black tracking-[0.3em] uppercase">System.Monitoring</h1>
        </div>
        <p className="text-[10px] text-neutral-500 tracking-widest uppercase">
          Real-time network performance and device health metrics
        </p>
      </div>

      {/* Monitoring Group Manager Section */}
      <MonitoringGroupManager />

      {/* Console Section */}
      <div className="border border-white/10 bg-black/60 p-4 font-mono">
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
          <Terminal className="w-4 h-4 text-neutral-500" />
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
            System.Console
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] text-neutral-500 flex gap-4">
            <span className="text-neutral-700">[08:00:00]</span>
            <span className="text-emerald-500/50">SYSTEM_READY</span>
            <span>Initializing monitoring modules...</span>
          </div>
          <div className="text-[10px] text-neutral-500 flex gap-4">
            <span className="text-neutral-700">[08:00:01]</span>
            <span className="text-blue-500/50">NETWORK_SCAN</span>
            <span>Connecting to SNMP data stream...</span>
          </div>
          <div className="text-[10px] text-neutral-500 flex gap-4">
            <span className="text-neutral-700">[08:00:02]</span>
            <span className="text-amber-500/50">WAITING</span>
            <span>Listening for incoming telemetry...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonitoringPage
