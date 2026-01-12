import React from 'react'

interface HeatmapRowProps {
  data: any[]
}

export const HeatmapRow: React.FC<HeatmapRowProps> = React.memo(({ data }) => (
  <div className="flex flex-wrap gap-[2px]">
    {data.map((point, i) => {
      const latency = point.responseTime ?? 0
      const color = !point.status ? 'bg-red-600' : latency > 150 ? 'bg-amber-500' : 'bg-emerald-600'
      return (
        <div
          key={i}
          title={`${new Date(point.checkTime).toLocaleTimeString()} - ${point.status ? 'UP (' + latency + 'ms)' : 'DOWN'}`}
          className={`w-3 h-3 ${color} rounded-[1px] hover:scale-125 transition-transform`}
        />
      )
    })}
  </div>
))
