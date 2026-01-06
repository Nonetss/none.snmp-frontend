import React from 'react'
import { Share2 } from 'lucide-react'

interface TopHubsProps {
  hubs: Array<{ name: string; connections: number }>
}

export const TopHubs: React.FC<TopHubsProps> = ({ hubs }) => (
  <div className="bg-neutral-900/10 border border-white/10 p-6 space-y-4">
    <h3 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 border-b border-white/10 pb-3">
      <Share2 className="w-3.5 h-3.5" /> Core_Nodes_Density
    </h3>
    <div className="space-y-2">
      {hubs?.map((hub, i) => (
        <div
          key={hub.name}
          className="group flex items-center justify-between p-3 bg-white/5 border border-transparent hover:border-white/20 transition-all"
        >
          <div className="flex items-center gap-4">
            <span className="text-neutral-500 text-[10px] font-bold">0{i + 1}</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white group-hover:tracking-wider transition-all uppercase">
                {hub.name}
              </span>
              <span className="text-[10px] text-neutral-400 uppercase">Network backbone node</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold">{hub.connections}</div>
            <div className="text-[10px] text-neutral-400 uppercase">Edges</div>
          </div>
        </div>
      ))}
    </div>
  </div>
)
