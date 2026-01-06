import React from 'react'
import { Database } from 'lucide-react'

interface SnmpDistributionProps {
  data: Array<{ version: string; deviceCount: number }>
  totalManaged: number
}

export const SnmpDistribution: React.FC<SnmpDistributionProps> = ({ data, totalManaged }) => (
  <div className="bg-neutral-900/10 border border-white/10 p-6 space-y-4">
    <h3 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 border-b border-white/10 pb-3">
      <Database className="w-3.5 h-3.5" /> Protocol_Distribution
    </h3>
    <div className="space-y-4 pt-2">
      {data?.map((item) => (
        <div key={item.version} className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
            <span className="text-neutral-400">SNMP.Version_{item.version}</span>
            <span className="text-white font-bold">{item.deviceCount} Units</span>
          </div>
          <div className="w-full h-1 bg-neutral-900">
            <div
              className="h-full bg-white transition-all duration-1000"
              style={{
                width: `${(item.deviceCount / (totalManaged || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)
