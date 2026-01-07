import React from 'react'
import { Zap } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface InterfaceHealthChartProps {
  stats: {
    up: number
    down: number
    other: number
  }
}

export const InterfaceHealthChart: React.FC<InterfaceHealthChartProps> = ({ stats }) => {
  const interfaceData = [
    { name: 'UP', value: stats?.up || 0, color: '#FFFFFF' },
    { name: 'DOWN', value: stats?.down || 0, color: '#404040' },
    { name: 'OTHER', value: stats?.other || 0, color: '#1A1A1A' },
  ]

  return (
    <div className="bg-neutral-900/10 border border-white/5 p-6 flex flex-col items-center justify-center space-y-8 min-h-full">
      <div className="flex flex-col items-center gap-2 border-b border-white/5 pb-4 w-full">
        <Zap className="w-5 h-5 text-white" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Interface_Health</h3>
      </div>

      <div className="h-[250px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={interfaceData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {interfaceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-black border border-white/10 p-2 font-mono text-[10px]">
                      <span className="text-white uppercase font-bold">
                        {payload[0].name}: {payload[0].value}
                      </span>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {stats?.up}
          </span>
          <span className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">
            Online.Ports
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 w-full pt-4">
        {interfaceData.map((item) => (
          <div key={item.name} className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] text-white font-black uppercase tracking-widest">
                {item.value}
              </span>
            </div>
            <span className="text-[8px] text-neutral-600 uppercase font-bold tracking-tighter">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
