import React from 'react'
import { Box, Database, Cpu } from 'lucide-react'
import type { DeviceDetail } from '@/features/devices/components/types'

interface InventoryTabProps {
  device: DeviceDetail
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ device }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
          <Box className="w-4 h-4" /> physical_inventory_FRU
        </h3>
        <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
          {device.physicalEntities?.map((entity: any, i: number) => (
            <div
              key={i}
              className="p-4 bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white uppercase">{entity.name}</span>
                <span className="text-[8px] px-1.5 py-0.5 bg-white/10 text-neutral-400 font-bold uppercase tracking-tighter">
                  CLASS_{entity.class}
                </span>
              </div>
              <p className="text-[9px] text-neutral-500 italic mb-4">"{entity.descr}"</p>
              <div className="grid grid-cols-2 gap-4 text-[9px] pt-2 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-neutral-700 uppercase font-bold">Manufacturer / Model</span>
                  <span className="text-white uppercase tracking-tighter">
                    {entity.mfgName} {entity.modelName}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-neutral-700 uppercase font-bold">Serial Number</span>
                  <span className="text-white font-mono">{entity.serialNum || 'NO_SERIAL'}</span>
                </div>
              </div>
            </div>
          ))}
          {(!device.physicalEntities || device.physicalEntities.length === 0) && (
            <div className="text-center py-20 text-[10px] text-neutral-700 uppercase tracking-[0.2em]">
              No physical inventory data available
            </div>
          )}
        </div>
      </section>

      <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
          <Database className="w-4 h-4" /> extended_hardware_resources
        </h3>
        <div className="space-y-4">
          {device.resources?.map((res: any, i: number) => (
            <div key={i} className="p-5 bg-neutral-900/40 border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 border border-white/10">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">{res.name}</h4>
                    <span className="text-[8px] text-neutral-500 uppercase tracking-widest">
                      {res.type}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-white">{res.value || 'N/A'}</span>
                </div>
              </div>

              {res.swInstalled?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="text-[8px] text-neutral-600 uppercase font-bold block mb-2">
                    Attached SW Packages: {res.swInstalled.length}
                  </span>
                </div>
              )}
            </div>
          ))}
          {(!device.resources || device.resources.length === 0) && (
            <div className="text-center py-20 text-[10px] text-neutral-700 uppercase tracking-[0.2em]">
              No hardware resources found
            </div>
          )}
        </div>
      </section>
    </div>
  </div>
)
