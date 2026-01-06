import React from 'react'
import {
  X,
  Shield,
  MapPin,
  User,
  Activity,
  ArrowRight,
  Server,
  Link2,
  HardDrive,
  Cpu,
  Globe,
} from 'lucide-react'
import type { GraphNode } from '@/features/graph/components/types'

interface NodeDetailsProps {
  node: GraphNode
  onClose: () => void
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose }) => {
  const isPort = node.type === 'port'
  const deviceId = isPort ? node.parentId : node.id

  return (
    <div className="fixed top-0 right-0 h-full w-[420px] z-[100] bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-[-20px_0_80px_rgba(0,0,0,0.8)] flex flex-col font-mono text-white animate-in slide-in-from-right duration-500">
      {/* Header Visual Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-emerald-500 to-rose-500" />

      {/* Header */}
      <div className="p-8 border-b border-white/5 bg-white/[0.02]">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`px-2 py-0.5 border ${isPort ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-blue-500/40 text-blue-400 bg-blue-500/5'} text-[9px] font-black uppercase tracking-[0.2em]`}
            >
              {node.type || 'device'}
            </div>
            {node.details?.system?.sysName && (
              <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">
                ID: {deviceId}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-neutral-500 hover:text-white transition-all rounded-none border border-transparent hover:border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-2xl font-black text-white leading-tight mb-2 tracking-tighter break-all italic uppercase">
          {node.label || 'Unknown Node'}
        </h3>

        {node.ip && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-neutral-400 font-bold tracking-widest font-mono">
              {node.ip}
            </span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      {!isPort && node.details?.id && (
        <div className="px-8 py-4 bg-white/5 border-b border-white/5">
          <a
            href={`/devices/${node.details.id}`}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all group"
          >
            <Server className="w-4 h-4" />
            Initialize Deep Inspection
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {/* System Overview */}
        {node.details?.system && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-blue-500" /> System_Overview
            </h4>

            <div className="bg-neutral-900/40 border border-white/5 p-5 space-y-5">
              <div className="space-y-2">
                <span className="text-[8px] text-neutral-600 uppercase font-bold tracking-widest">
                  Description
                </span>
                <p className="text-[11px] text-neutral-400 italic leading-relaxed pl-4 border-l border-white/10">
                  "{node.details.system.sysDescr}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-[8px] text-neutral-600 uppercase font-bold">Location</span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-300 uppercase truncate">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    {node.details.system.sysLocation || 'Undefined'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] text-neutral-600 uppercase font-bold">Admin</span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-300 uppercase truncate">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    {node.details.system.sysContact || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connectivity / Interfaces */}
        {node.details?.interfaces && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-500" /> Interface_Matrix
              </h4>
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-bold text-neutral-500">
                TOTAL: {node.details.interfaces.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {node.details.interfaces.map((iface, i) => (
                <div
                  key={i}
                  className="group p-3 bg-neutral-900/20 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-1 h-6 ${iface.ifAdminStatus === 1 ? 'bg-emerald-500' : 'bg-neutral-800'}`}
                    />
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="text-[11px] font-bold text-neutral-300 group-hover:text-white transition-colors truncate uppercase">
                        {iface.ifName}
                      </div>
                      <div className="text-[9px] text-neutral-600 truncate italic">
                        {iface.ifDescr}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[9px] font-bold text-neutral-500 group-hover:text-neutral-400">
                      {iface.ifSpeed ? `${(iface.ifSpeed / 1000000).toFixed(0)}M` : 'N/A'}
                    </div>
                    {iface.ifAdminStatus === 1 && (
                      <div className="text-[7px] font-black text-emerald-500/60 uppercase tracking-tighter">
                        Active
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Status Area */}
      <div className="p-6 border-t border-white/5 bg-white/[0.02] mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-white animate-ping absolute inset-0 opacity-20" />
              <div className="w-2 h-2 rounded-full bg-white relative" />
            </div>
            <span className="text-[9px] text-neutral-500 uppercase font-black tracking-[0.2em]">
              Node_Status: Verified
            </span>
          </div>
          <span className="text-[8px] text-neutral-700 font-bold">UUID_{node.id.slice(0, 8)}</span>
        </div>
      </div>
    </div>
  )
}
