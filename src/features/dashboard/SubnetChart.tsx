import React from 'react'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SubnetChartProps {
  data: Array<{ cidr: string; deviceCount: number }>
}

export const SubnetChart: React.FC<SubnetChartProps> = ({ data }) => {
  // Ordenar por número de dispositivos para mejor visualización
  const sortedData = [...data].sort((a, b) => b.deviceCount - a.deviceCount)

  // Calcular altura dinámica: mínimo 300px, o 30px por cada subred
  const dynamicHeight = Math.max(300, sortedData.length * 35)

  return (
    <div className="lg:col-span-2 bg-neutral-900/20 border border-white/10 p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5" /> Subnet_Capacity_Map
        </h3>
        <span className="text-[10px] text-neutral-400 tracking-widest">
          Y-AXIS: CIDR / X-AXIS: NODES
        </span>
      </div>

      {/* Contenedor con scroll si hay demasiadas subredes */}
      <div className="w-full overflow-y-auto max-h-[500px] custom-scrollbar pr-4">
        <div style={{ height: `${dynamicHeight}px`, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f1f1f"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                stroke="#444"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#666' }}
              />
              <YAxis
                dataKey="cidr"
                type="category"
                stroke="#888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fill: '#888', fontWeight: 'bold' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000',
                  border: '1px solid #333',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar
                dataKey="deviceCount"
                fill="#ffffff"
                radius={[0, 2, 2, 0]}
                barSize={20}
                label={{
                  position: 'right',
                  fill: '#444',
                  fontSize: 9,
                  formatter: (val: number) => (val > 0 ? val : ''),
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
