import React from 'react'
import { Info, MapPin, Clock, Database, Activity, Network as NetworkIcon } from 'lucide-react'
import type { DeviceDetail, TabId, AddrEntry, Resource } from '@/features/devices/components/types'

interface DashboardTabProps {
  device: DeviceDetail
  setActiveTab: (tab: TabId) => void
  hasNeighbors: boolean
  onEditLocation?: () => void
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  device,
  setActiveTab,
  hasNeighbors,
  onEditLocation,
}) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2 bg-neutral-900/20 border border-white/10 p-6 space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
          <Info className="w-4 h-4" /> system_specifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
                Description
              </span>
              <p className="text-xs text-neutral-400 italic leading-relaxed border-l-2 border-white/10 pl-4 py-1">
                "{device.system?.sysDescr}"
              </p>
            </div>
            <div className="flex justify-between items-center text-[11px] pt-4">
              <span className="text-neutral-500 uppercase">SysName</span>
              <span className="font-bold">{device.system?.sysName || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 relative group/loc">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold">Location</span>
                  <button
                    onClick={onEditLocation}
                    className="text-[8px] text-neutral-600 hover:text-white uppercase font-black transition-colors"
                  >
                    [ Edit ]
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-white">
                  <MapPin className="w-3 h-3 text-neutral-500" />
                  <span className="uppercase">
                    {device.location?.name || device.system?.sysLocation || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Uptime</span>
                <div className="flex items-center gap-2 text-xs text-white">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  <span>
                    {device.system?.sysUpTime
                      ? new Date(device.system.sysUpTime).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-neutral-500 uppercase">Contact</span>
                <span className="font-bold">{device.system?.sysContact || 'NOT_DEFINED'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-neutral-500 uppercase">Services_Bitmask</span>
                <span className="font-bold">{device.system?.sysServices}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-900/10 border border-white/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.4em] flex items-center gap-3">
          <Database className="w-4 h-4" /> hardware_resources
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {device.resources?.map((res: Resource, i: number) => (
            <div
              key={i}
              className="p-3 bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-white uppercase">{res.name}</span>
                <span className="text-[10px] px-1 bg-white/10 text-neutral-400 uppercase tracking-tighter">
                  {res.type}
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 italic line-clamp-1">{res.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section className="bg-neutral-900/10 border border-white/5 p-6 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-3">
          <Activity className="w-4 h-4" /> quick_ipv4_table
        </h3>
        <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
          {device.ipSnmp?.addrEntries?.slice(0, 5).map((addr: AddrEntry, i: number) => (
            <div key={i} className="p-3 border border-white/5 bg-neutral-900/40">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white">{addr.ipAdEntAddr}</span>
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter">
                  IF: {addr.ipAdEntIfIndex}
                </span>
              </div>
            </div>
          ))}
          {device.ipSnmp?.addrEntries?.length > 5 && (
            <button
              onClick={() => setActiveTab('interfaces')}
              className="w-full py-2 text-[8px] text-neutral-500 uppercase hover:text-white transition-all"
            >
              View.All.Addresses({device.ipSnmp.addrEntries.length})
            </button>
          )}
        </div>
      </section>

      <section className="lg:col-span-2 bg-neutral-900/10 border border-white/5 p-6 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-3">
          <NetworkIcon className="w-4 h-4" /> neighbor_discovery_summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasNeighbors ? (
            <>
              <div className="space-y-2">
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">
                  Outbound.Neighbors
                </span>
                {device.neighbor_discovery?.outbound?.slice(0, 2)?.map((n: any, i: number) => (
                  <div
                    key={`out-${i}`}
                    className="p-3 border border-white/5 bg-white/5 flex flex-col gap-1"
                  >
                    <span className="text-xs font-bold text-white uppercase">
                      {n.sysName || n.remoteDeviceName || 'REMOTE_NODE'}
                    </span>
                    <span className="text-[9px] text-neutral-500 uppercase tracking-tighter">
                      {n.portId} {'->'} {n.portDesc}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">
                  Inbound.Discovery
                </span>
                {device.neighbor_discovery?.inbound?.slice(0, 2)?.map((n: any, i: number) => (
                  <div
                    key={`in-${i}`}
                    className="p-3 border border-white/5 bg-white/5 flex flex-col gap-1"
                  >
                    <span className="text-xs font-bold text-white uppercase">
                      {n.neighborSysName || n.remoteDeviceName || 'DETECTED_NODE'}
                    </span>
                    <span className="text-[9px] text-neutral-500 uppercase tracking-tighter">
                      {n.address || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="col-span-2 h-24 flex items-center justify-center border border-dashed border-white/10">
              <span className="text-[8px] text-neutral-600 uppercase tracking-widest">
                No active neighbors found
              </span>
            </div>
          )}
        </div>
        {hasNeighbors && (
          <button
            onClick={() => setActiveTab('discovery')}
            className="w-full mt-2 py-2 border border-white/5 text-[8px] text-neutral-500 uppercase hover:bg-white/5 transition-all"
          >
            Open.Discovery.Matrix()
          </button>
        )}
      </section>
    </div>
  </div>
)
