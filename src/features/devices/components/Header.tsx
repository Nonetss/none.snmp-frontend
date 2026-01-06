import React from 'react'
import { ArrowLeft, Server, Database, RefreshCcw } from 'lucide-react'
import type { DeviceDetail } from '@/features/devices/components/types'

interface HeaderProps {
  device: DeviceDetail
  polling: boolean
  onFullPoll: () => void
  onRescan: () => void
}

export const Header: React.FC<HeaderProps> = ({ device, polling, onFullPoll, onRescan }) => (
  <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 p-6 flex justify-between items-center">
    <div className="flex items-center gap-6">
      <a
        href="/devices"
        className="p-2 border border-white/10 hover:bg-white hover:text-black transition-all group"
      >
        <ArrowLeft className="w-4 h-4" />
      </a>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-white" />
          <h1 className="text-xl font-bold tracking-tighter uppercase">{device.name}</h1>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3" /> ID:{device.id}
          </span>
          <span className="flex items-center gap-1 text-white">
            <div className="w-1 h-1 bg-white rounded-full animate-pulse" /> {device.ipv4}
          </span>
        </div>
      </div>
    </div>
    <div className="flex gap-4">
      <button
        onClick={onFullPoll}
        disabled={polling}
        className={`px-4 py-2 border border-white/10 text-[10px] uppercase font-bold transition-all flex items-center gap-2 ${
          polling ? 'bg-white text-black animate-pulse' : 'hover:bg-white/5'
        }`}
      >
        {polling ? (
          <RefreshCcw className="w-3 h-3 animate-spin" />
        ) : (
          <Database className="w-3 h-3" />
        )}
        {polling ? 'Polling...' : 'Full.SNMP.Poll()'}
      </button>
      <button
        onClick={onRescan}
        className="px-4 py-2 border border-white/10 text-[10px] uppercase font-bold hover:bg-white/5 flex items-center gap-2"
      >
        <RefreshCcw className="w-3 h-3" /> Re-Scan
      </button>
      <div className="hidden sm:block px-4 py-2 border border-white/20 bg-white text-black text-[10px] uppercase font-bold">
        Status: Managed
      </div>
    </div>
  </div>
)
