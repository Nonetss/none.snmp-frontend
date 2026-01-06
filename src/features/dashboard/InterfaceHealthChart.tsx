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
    { name: 'DOWN', value: stats?.down || 0, color: '#A3A3A3' },
    { name: 'OTHER', value: stats?.other || 0, color: '#525252' },
  ]

  return (
    <div className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" /> Interface_Health
        </h3>
      </div>
      <div className="h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={interfaceData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {interfaceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#000',
                border: '1px solid #333',
                fontSize: '11px',
              }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold tracking-tighter">{stats?.up}</span>
          <span className="text-[10px] text-neutral-400 uppercase">Active.Ports</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 pt-2">
        {interfaceData.map((item) => (
          <div
            key={item.name}
            className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1"
          >
            <span className="text-neutral-400 flex items-center gap-2 uppercase tracking-widest">
              <div className="w-1.5 h-1.5" style={{ backgroundColor: item.color }} /> {item.name}
            </span>
            <span className="font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
