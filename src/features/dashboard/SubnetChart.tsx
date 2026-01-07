import React from 'react'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SubnetChartProps {
  data: Array<{
    cidr: string
    deviceCount: number
    upCount: number
    downCount: number
    subnetName?: string
  }>
}

export const SubnetChart: React.FC<SubnetChartProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.deviceCount - a.deviceCount)
  const dynamicHeight = Math.max(300, sortedData.length * 40)

  return (
    <div className="lg:col-span-2 bg-neutral-900/10 border border-white/5 p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
          <BarChart3 className="w-4 h-4 text-white" /> Subnet_Capacity_Map
        </h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">
              Online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
            <span className="text-[9px] text-neutral-600 uppercase font-black tracking-widest">
              Offline
            </span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
        <div style={{ height: `${dynamicHeight}px`, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              barGap={0}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="#ffffff05"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                stroke="#222"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#444', fontVariant: 'tabular-nums' }}
              />
              <YAxis
                dataKey="cidr"
                type="category"
                stroke="#444"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fill: '#666', fontWeight: 'bold', fontFamily: 'monospace' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className="bg-[#080808] border border-white/10 p-4 shadow-2xl backdrop-blur-md ring-1 ring-white/5">
                        <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-2">
                          <div className="w-1 h-3 bg-white" />
                          <span className="text-[11px] text-white font-black uppercase tracking-widest">
                            {d.subnetName || label}
                          </span>
                        </div>
                        <div className="space-y-2.5 min-w-[150px]">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-neutral-500 font-bold uppercase tracking-tighter">
                              Total Nodes
                            </span>
                            <span className="text-white font-mono">{d.deviceCount}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                              <span className="text-neutral-400 uppercase tracking-tighter">
                                Online
                              </span>
                            </div>
                            <span className="text-white font-mono font-bold">{d.upCount}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-neutral-800" />
                              <span className="text-neutral-600 uppercase tracking-tighter">
                                Offline
                              </span>
                            </div>
                            <span className="text-neutral-400 font-mono">{d.downCount}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="upCount"
                stackId="a"
                fill="#ffffff"
                barSize={12}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="downCount"
                stackId="a"
                fill="#1a1a1a"
                barSize={12}
                radius={[0, 1, 1, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
