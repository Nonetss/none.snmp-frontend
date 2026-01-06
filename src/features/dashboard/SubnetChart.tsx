import React from 'react'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SubnetChartProps {
  data: Array<{ cidr: string; deviceCount: number }>
}

export const SubnetChart: React.FC<SubnetChartProps> = ({ data }) => (
  <div className="lg:col-span-2 bg-neutral-900/20 border border-white/10 p-6 space-y-6">
    <div className="flex justify-between items-center border-b border-white/10 pb-4">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5" /> Subnet_Capacity_Map
      </h3>
      <span className="text-[8px] text-neutral-600 tracking-widest">
        X-AXIS: SUBNET_CIDR / Y-AXIS: DEVICE_COUNT
      </span>
    </div>
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
          <XAxis
            dataKey="cidr"
            stroke="#555"
            fontSize={8}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#555' }}
          />
          <YAxis
            stroke="#555"
            fontSize={8}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#555' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#000',
              border: '1px solid #333',
              fontSize: '10px',
            }}
            itemStyle={{ color: '#fff' }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey="deviceCount" fill="#ffffff" radius={[2, 2, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
)
