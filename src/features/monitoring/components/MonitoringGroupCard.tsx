import React from 'react'
import { Users, Edit2, Trash2, Server, ChevronRight } from 'lucide-react'
import type { MonitoringGroup } from '../types'

interface MonitoringGroupCardProps {
  group: MonitoringGroup
  onEdit: (group: MonitoringGroup) => void
  onDelete: (id: number) => void
}

export const MonitoringGroupCard: React.FC<MonitoringGroupCardProps> = ({
  group,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="group relative border border-white/10 bg-neutral-900/20 p-6 flex flex-col justify-between min-h-[160px] hover:border-white/30 transition-all">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-black uppercase tracking-widest text-white">
              {group.name}
            </span>
          </div>
          <p className="text-[10px] text-neutral-500 line-clamp-2 uppercase leading-relaxed">
            {group.description || 'No description provided'}
          </p>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(group)}
            className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
            title="Edit Group"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(group.id)}
            className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-red-500/5 transition-colors"
            title="Delete Group"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Server className="w-3 h-3 text-neutral-600" />
          <span className="text-[10px] font-bold text-neutral-400">
            {group.deviceCount ?? 0} DEVICES
          </span>
        </div>
        <button
          onClick={() => onEdit(group)}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:underline flex items-center gap-1"
        >
          Manage_Group <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
