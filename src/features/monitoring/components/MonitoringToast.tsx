import React from 'react'
import { Check, X } from 'lucide-react'

interface MonitoringToastProps {
  visible: boolean
  message: string
  onClose: () => void
}

export const MonitoringToast: React.FC<MonitoringToastProps> = ({ visible, message, onClose }) => {
  if (!visible) return null

  return (
    <div className="fixed bottom-8 right-8 z-[300] animate-in slide-in-from-right-full duration-500">
      <div className="bg-black border border-white/20 p-4 min-w-[300px] shadow-2xl flex items-center gap-4">
        <div className="w-8 h-8 rounded-none border border-white/20 flex items-center justify-center bg-white/5">
          <Check className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">
            Monitoring.System
          </div>
          <div className="text-[11px] text-neutral-400 uppercase tracking-tighter">{message}</div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/5 text-neutral-600 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="h-0.5 bg-neutral-800 w-full overflow-hidden">
        <div className="h-full bg-white animate-progress-shrink origin-left" />
      </div>
    </div>
  )
}
