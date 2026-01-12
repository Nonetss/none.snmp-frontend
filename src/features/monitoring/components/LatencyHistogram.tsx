import React from 'react'

interface LatencyHistogramProps {
  data: any[]
  height: number
}

export const LatencyHistogram: React.FC<LatencyHistogramProps> = React.memo(({ data, height }) => {
  // Normalize latency for bar height
  const values = data.filter((d) => d.status && d.responseTime != null).map((d) => d.responseTime)
  const maxLat = Math.max(...values, 100)

  return (
    <div className="flex items-end w-full h-full overflow-hidden" style={{ height }}>
      {data.map((point, i) => {
        const latency = point.responseTime ?? 0
        const h = point.status ? Math.min((latency / maxLat) * 100, 100) : 100
        const color = !point.status
          ? 'bg-red-600'
          : latency > 150
            ? 'bg-amber-500'
            : latency > 50
              ? 'bg-emerald-400'
              : 'bg-emerald-600'

        return (
          <div
            key={i}
            title={`${new Date(point.checkTime).toLocaleTimeString()} - ${point.status ? latency + 'ms' : 'DOWN'}`}
            className={`flex-grow h-full min-w-0 ${color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: `${Math.max(h, 15)}%` }}
          />
        )
      })}
    </div>
  )
})
