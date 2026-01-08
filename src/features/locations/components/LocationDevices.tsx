import React from 'react'
import {
  Globe,
  ChevronDown,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Search,
} from 'lucide-react'
import type { Subnet } from '../types'

interface Props {
  subnets: Subnet[]
  expandedSubnets: number[]
  onToggleExpand: (id: number) => void
  loading: boolean
}

export const LocationDevices: React.FC<Props> = ({
  subnets,
  expandedSubnets,
  onToggleExpand,
  loading,
}) => {
  if (subnets.length === 0 && !loading) {
    return (
      <div className="p-12 text-center border border-white/10 bg-neutral-900/5">
        <div className="flex flex-col items-center gap-3 opacity-30">
          <Search className="w-8 h-8" />
          <span className="text-[10px] uppercase tracking-[0.3em]">No_Devices_Assigned</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {subnets.map((subnet) => (
        <div key={subnet.id} className="border border-white/10 bg-neutral-900/10 overflow-hidden">
          <button
            onClick={() => onToggleExpand(subnet.id)}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  {subnet.name || 'Unnamed'} ({subnet.cidr})
                </span>
              </div>
              <span className="px-2 py-0.5 bg-white/5 text-[8px] text-neutral-500 uppercase font-bold border border-white/5">
                {subnet.devices?.length || 0} Units
              </span>
            </div>
            {expandedSubnets.includes(subnet.id) ? (
              <ChevronDown className="w-4 h-4 text-neutral-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            )}
          </button>

          {expandedSubnets.includes(subnet.id) && (
            <div className="overflow-x-auto animate-in slide-in-from-top-1 duration-200 border-t border-white/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/40">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 w-16">
                      ID
                    </th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Identity
                    </th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      IP_Address
                    </th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subnet.devices?.map((device) => (
                    <tr key={device.id} className="hover:bg-white/[0.02] group transition-colors">
                      <td className="p-4 text-[11px] text-neutral-500 font-bold">#{device.id}</td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider group-hover:text-white transition-colors">
                          {device.name || 'UNKNOWN_NODE'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-neutral-400 group-hover:text-neutral-300 font-mono transition-colors">
                          {device.ipv4}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={`/devices/${device.id}`}
                          className="inline-block p-1.5 border border-white/5 text-neutral-700 hover:text-white hover:border-white/40 transition-all"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
