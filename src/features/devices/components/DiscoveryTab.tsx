import React from 'react'
import { Network, ChevronRight } from 'lucide-react'
import type { DeviceDetail } from '@/features/devices/components/types'

interface DiscoveryTabProps {
  device: DeviceDetail
}

export const DiscoveryTab: React.FC<DiscoveryTabProps> = ({ device }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
          <Network className="w-4 h-4" /> neighbor_discovery_matrix
        </h3>
        <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
          Protocols: LLDP, CDP
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <ChevronRight className="w-3 h-3" /> Outbound.Neighbors
          </h4>
          <div className="space-y-3">
            {device.neighbor_discovery?.outbound?.map((n: any, i: number) => (
              <div
                key={`out-${i}`}
                className="p-4 bg-white/5 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-white uppercase">
                      {n.sysName || n.remoteDeviceName || 'REMOTE_NODE'}
                    </span>
                    <div className="text-[8px] text-neutral-500 uppercase mt-0.5">
                      {n.sysDesc?.slice(0, 100)}...
                    </div>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 bg-white/10 text-neutral-300 uppercase font-bold tracking-tighter">
                    {n.protocol}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-neutral-600 uppercase font-bold">
                      Local Interface
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Port {n.localPortNum || n.portId}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] text-neutral-600 uppercase font-bold">
                      Remote Port
                    </span>
                    <span className="text-[10px] text-neutral-400">{n.portDesc || n.portId}</span>
                  </div>
                </div>
              </div>
            ))}
            {(!device.neighbor_discovery?.outbound ||
              device.neighbor_discovery.outbound.length === 0) && (
              <div className="h-32 flex items-center justify-center border border-dashed border-white/5 text-[8px] text-neutral-700 uppercase">
                No outbound neighbors reported
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <ChevronRight className="w-3 h-3" /> Inbound.Discovery
          </h4>
          <div className="space-y-3">
            {device.neighbor_discovery?.inbound?.map((n: any, i: number) => (
              <div
                key={`in-${i}`}
                className="p-4 bg-white/5 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-white uppercase">
                      {n.neighborSysName || n.remoteDeviceName || 'DETECTED_NODE'}
                    </span>
                    <div className="text-[8px] text-neutral-500 uppercase mt-0.5">
                      {n.neighborPlatform || 'Generic Platform'}
                    </div>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 bg-white/10 text-neutral-300 uppercase font-bold tracking-tighter">
                    {n.protocol}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-neutral-600 uppercase font-bold">
                      Reported Address
                    </span>
                    <span className="text-[10px] text-neutral-400">{n.address || 'Unknown'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] text-neutral-600 uppercase font-bold">
                      Remote Port
                    </span>
                    <span className="text-[10px] text-neutral-400">{n.neighborPort}</span>
                  </div>
                </div>
              </div>
            ))}
            {(!device.neighbor_discovery?.inbound ||
              device.neighbor_discovery.inbound.length === 0) && (
              <div className="h-32 flex items-center justify-center border border-dashed border-white/5 text-[8px] text-neutral-700 uppercase">
                No inbound discovery data
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  </div>
)
