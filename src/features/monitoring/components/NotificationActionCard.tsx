import React from 'react'
import {
  Edit2,
  CheckCircle2,
  Circle,
  Trash2,
  Shield,
  AlertTriangle,
  Clock,
  Bell,
} from 'lucide-react'
import type { NotificationAction } from '../types'

interface NotificationActionCardProps {
  action: any
  onEdit: (action: any) => void
  onToggle: (action: any) => void
  onDelete: (id: number) => void
}

export const NotificationActionCard: React.FC<NotificationActionCardProps> = ({
  action,
  onEdit,
  onToggle,
  onDelete,
}) => {
  return (
    <div
      className={`group relative border ${action.enabled ? 'border-white/10' : 'border-white/5 opacity-60'} bg-neutral-900/20 p-6 space-y-4 hover:border-white/30 transition-all`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white">
            {action.type}
          </div>
          {!action.enabled && (
            <span className="text-[8px] border border-red-500/50 text-red-500 px-1 font-bold uppercase">
              Disabled
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(action)}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggle(action)}
            className={`p-1 transition-colors ${action.enabled ? 'text-emerald-500' : 'text-neutral-500 hover:text-white'}`}
          >
            {action.enabled ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(action.id)}
            className="p-1 text-neutral-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-white">
          <Shield className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-bold uppercase tracking-tighter truncate">
            {action.monitorRule?.name || `Rule #${action.monitorRuleId}`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-neutral-600 font-bold uppercase">Failures</span>
            <div className="flex items-center gap-2 text-[10px] text-white font-mono">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              {action.consecutiveFailures}x
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-neutral-600 font-bold uppercase">Repeat</span>
            <div className="flex items-center gap-2 text-[10px] text-white font-mono">
              <Clock className="w-3 h-3 text-neutral-500" />
              {action.repeatIntervalMins}m
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pb-2 border-b border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-neutral-600 font-bold uppercase">Devices</span>
            <div className="text-[9px] text-white uppercase font-bold tracking-tighter">
              {action.deviceAggregation === 'any' && 'Any'}
              {action.deviceAggregation === 'all' && 'All'}
              {action.deviceAggregation === 'percentage' && `${action.deviceAggregationValue}%`}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[8px] text-neutral-600 font-bold uppercase">Ports</span>
            <div className="text-[9px] text-white uppercase font-bold tracking-tighter">
              {action.portAggregation === 'any' && 'Any'}
              {action.portAggregation === 'all' && 'All'}
              {action.portAggregation === 'percentage' && `${action.portAggregationValue}%`}
            </div>
          </div>
        </div>

        {action.ntfyAction && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-white font-bold uppercase">
              <Bell className="w-3.5 h-3.5 text-blue-500" />
              Topic: {action.ntfyAction.topic?.topic || `#${action.ntfyAction.ntfyTopicId}`}
            </div>
            <div className="flex flex-wrap gap-1">
              {action.ntfyAction.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[8px] px-1 border border-white/10 text-neutral-500 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {action.lastSentAt && (
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[8px] text-neutral-600 uppercase font-bold">Last Alert Sent</span>
            <span className="text-[9px] text-neutral-400 font-mono">
              {new Date(action.lastSentAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
