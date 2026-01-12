import React from 'react'
import { HeatmapRow } from './HeatmapRow'

interface DensityViewProps {
  data: any[]
}

export const DensityView: React.FC<DensityViewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {data.map((item) => (
        <div
          key={item.key}
          className="p-4 bg-neutral-900/20 border border-white/5 hover:border-white/20 transition-colors"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-white truncate pr-2" title={item.name}>
                {item.name}
              </h3>
              <div className="flex gap-2 text-[9px] text-neutral-500 font-mono mt-0.5">
                <span>{item.ip}</span>
                <span>:</span>
                <span>{item.port}</span>
              </div>
            </div>
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isUp ? 'bg-emerald-500' : 'bg-red-500'}`}
            />
          </div>
          <HeatmapRow data={item.history} />
        </div>
      ))}
    </div>
  )
}
