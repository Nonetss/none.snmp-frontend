import React from 'react'
import {
  Shield,
  Edit2,
  CheckCircle2,
  Circle,
  Trash2,
  Users,
  Hash,
  Calendar,
  Clock,
} from 'lucide-react'
import type { MonitoringRule } from '../types'

interface MonitoringRuleCardProps {
  rule: MonitoringRule
  onEdit: (rule: MonitoringRule) => void
  onToggle: (rule: MonitoringRule) => void
  onDelete: (id: number) => void
}

export const MonitoringRuleCard: React.FC<MonitoringRuleCardProps> = ({
  rule,
  onEdit,
  onToggle,
  onDelete,
}) => {
  return (
    <div
      className={`group relative border ${
        rule.enabled ? 'border-white/10' : 'border-white/5 opacity-60'
      } bg-neutral-900/20 p-6 flex flex-col justify-between min-h-[160px] hover:border-white/30 transition-all`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 border transition-colors ${rule.enabled ? 'bg-white/5 border-white/10 text-white' : 'bg-black border-white/5 text-neutral-700'}`}
          >
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{rule.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${rule.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-700'}`}
              />
              <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">
                {rule.enabled ? 'ACTIVE_DAEMON' : 'PAUSED_DAEMON'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(rule)}
            className="p-1.5 text-neutral-600 hover:text-white transition-colors border border-transparent hover:border-white/10 bg-white/0 hover:bg-white/5"
            title="Edit Rule"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggle(rule)}
            className={`p-1.5 transition-colors border border-transparent hover:border-white/10 bg-white/0 hover:bg-white/5 ${
              rule.enabled ? 'text-emerald-500' : 'text-neutral-600 hover:text-white'
            }`}
            title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}
          >
            {rule.enabled ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Circle className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className="p-1.5 text-neutral-600 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/10 bg-white/0 hover:bg-red-500/5"
            title="Delete Rule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 p-3 bg-black/40 border border-white/5">
          <div className="flex items-center gap-2 text-neutral-600">
            <Users className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">Target Group</span>
          </div>
          <div className="text-[10px] text-white font-bold uppercase truncate">
            {rule.deviceGroup?.name || `Group #${rule.deviceGroupId}`}
          </div>
        </div>
        <div className="space-y-2 p-3 bg-black/40 border border-white/5">
          <div className="flex items-center gap-2 text-neutral-600">
            <Hash className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">Port Set</span>
          </div>
          <div className="text-[10px] text-white font-bold uppercase truncate">
            {rule.portGroup?.name || `Ports #${rule.portGroupId}`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
        <div className="space-y-1">
          <span className="text-[8px] text-neutral-600 uppercase font-black tracking-widest">
            Schedule_Cron
          </span>
          <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
            <Calendar className="w-3 h-3 opacity-50" />
            {rule.cronExpression}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[8px] text-neutral-600 uppercase font-black tracking-widest">
            Next_Run
          </span>
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
            <Clock className="w-3 h-3 opacity-50" />
            {rule.nextRun ? new Date(rule.nextRun).toLocaleTimeString() : 'WAITING'}
          </div>
        </div>
      </div>
    </div>
  )
}
