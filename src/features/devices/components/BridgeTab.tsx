import React, { useState } from 'react'
import { Box, Network, Layers, Hash } from 'lucide-react'
import type { DeviceDetail, Port, Fdb, FdbQ, Vlan } from '@/features/devices/components/types'

interface BridgeTabProps {
  device: DeviceDetail
}

export const BridgeTab: React.FC<BridgeTabProps> = ({ device }) => {
  const [activeSubTab, setActiveSubTab] = useState<'vlans' | 'fdb' | 'ports'>('vlans')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Bridge Base Info */}
      <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
          <Box className="w-4 h-4" /> bridge_base_architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 border border-white/5">
            <span className="text-[7px] text-neutral-600 uppercase font-bold block mb-1">
              Bridge Address
            </span>
            <span className="text-xs font-mono text-white">
              {device.bridge?.base?.bridgeAddress || 'NULL'}
            </span>
          </div>
          <div className="p-4 bg-white/5 border border-white/5">
            <span className="text-[7px] text-neutral-600 uppercase font-bold block mb-1">
              Total Ports
            </span>
            <span className="text-xs font-mono text-white">
              {device.bridge?.base?.numPorts || 0}
            </span>
          </div>
          <div className="p-4 bg-white/5 border border-white/5">
            <span className="text-[7px] text-neutral-600 uppercase font-bold block mb-1">
              Bridge Type
            </span>
            <span className="text-xs font-mono text-white">
              CLASS_{device.bridge?.base?.type || 0}
            </span>
          </div>
          <div className="p-4 bg-white/5 border border-white/5">
            <span className="text-[7px] text-neutral-600 uppercase font-bold block mb-1">
              Last Update
            </span>
            <span className="text-xs font-mono text-white">
              {new Date(device.bridge?.base?.updatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </section>

      {/* Bridge Sub-Tabs */}
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveSubTab('vlans')}
            className={`px-6 py-3 text-[9px] uppercase font-bold tracking-[0.2em] transition-all border-b-2 ${activeSubTab === 'vlans' ? 'border-white text-white bg-white/5' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            VLANs ({device.bridge?.vlans?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('fdb')}
            className={`px-6 py-3 text-[9px] uppercase font-bold tracking-[0.2em] transition-all border-b-2 ${activeSubTab === 'fdb' ? 'border-white text-white bg-white/5' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            FDB Table ({(device.bridge?.fdb?.length || 0) + (device.bridge?.fdbQ?.length || 0)})
          </button>
          <button
            onClick={() => setActiveSubTab('ports')}
            className={`px-6 py-3 text-[9px] uppercase font-bold tracking-[0.2em] transition-all border-b-2 ${activeSubTab === 'ports' ? 'border-white text-white bg-white/5' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          >
            Bridge Ports ({device.bridge?.ports?.length || 0})
          </button>
        </div>

        {activeSubTab === 'vlans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {device.bridge?.vlans?.map((vlan: Vlan, i: number) => (
              <div
                key={i}
                className="p-4 bg-neutral-900/40 border border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex justify-between w-full px-4">
                    <span className="text-xs font-bold text-white uppercase group-hover:tracking-wider transition-all">
                      {vlan.name || `VLAN_${vlan.vlanId}`}
                    </span>
                    <span className="text-xs text-neutral-600 font-bold uppercase">
                      ID: {vlan.vlanId}
                    </span>
                  </div>
                  <Layers className="w-4 h-4 text-neutral-700 group-hover:text-white transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'fdb' && (
          <section className="bg-neutral-900/20 border border-white/10 overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-neutral-900 border-b border-white/10 z-10">
                  <tr className="text-[8px] text-neutral-500 uppercase tracking-widest">
                    <th className="p-4">MAC Address</th>
                    <th className="p-4">Port</th>
                    <th className="p-4">VLAN ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {/* FDB Q (VLAN Aware) */}
                  {device.bridge?.fdbQ?.map((entry: FdbQ, i: number) => (
                    <tr
                      key={`fdbq-${i}`}
                      className="text-[10px] group hover:bg-white/5 transition-all"
                    >
                      <td className="p-4 font-mono text-white font-bold">{entry.address}</td>
                      <td className="p-4 text-neutral-400">P_{entry.port}</td>
                      <td className="p-4 text-neutral-500">VID_{entry.vlanId}</td>
                      <td className="p-4">
                        <span className="px-1.5 py-0.5 bg-white/5 text-[8px] uppercase border border-white/5">
                          Status_{entry.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-neutral-600">
                        {new Date(entry.updatedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {/* Generic FDB */}
                  {device.bridge?.fdb?.map((entry: Fdb, i: number) => (
                    <tr
                      key={`fdb-${i}`}
                      className="text-[10px] group hover:bg-white/5 transition-all"
                    >
                      <td className="p-4 font-mono text-white font-bold">{entry.address}</td>
                      <td className="p-4 text-neutral-400">P_{entry.port}</td>
                      <td className="p-4 text-neutral-500">N/A</td>
                      <td className="p-4">
                        <span className="px-1.5 py-0.5 bg-white/5 text-[8px] uppercase border border-white/5">
                          Status_{entry.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-neutral-600">
                        {new Date(entry.updatedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!device.bridge?.fdbQ?.length && !device.bridge?.fdb?.length && (
                <div className="py-20 text-center text-[10px] text-neutral-700 uppercase tracking-widest italic">
                  Forwarding database is empty
                </div>
              )}
            </div>
          </section>
        )}

        {activeSubTab === 'ports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {device.bridge?.ports?.map((port: Port, i: number) => (
              <div
                key={i}
                className="p-4 bg-neutral-900/40 border border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase">
                      Port {port.bridgePort}
                    </span>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter">
                      IF_INDEX: {port.ifIndex}
                    </span>
                  </div>
                  <Hash className="w-3 h-3 text-neutral-700 group-hover:text-white transition-all" />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-[8px] text-neutral-500 uppercase">PVID</span>
                  <span className="text-xs font-mono text-white font-bold">{port.pvid}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
