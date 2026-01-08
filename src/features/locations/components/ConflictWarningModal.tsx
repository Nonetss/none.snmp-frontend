import React from 'react'
import { AlertCircle, X, RefreshCcw } from 'lucide-react'

interface Props {
  conflictData: { message: string; devices: any[] } | null
  submitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ConflictWarningModal: React.FC<Props> = ({
  conflictData,
  submitting,
  onClose,
  onConfirm,
}) => {
  if (!conflictData) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-neutral-950 border border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-red-500">
              Assignment.Conflict
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-neutral-200 font-bold uppercase tracking-tight">
              {conflictData.message}
            </p>
            <p className="text-[10px] text-neutral-500 uppercase leading-relaxed">
              The following devices (and potentially others) are already registered to a location:
            </p>
          </div>

          <div className="bg-black/40 border border-white/5 p-3 space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
            {conflictData.devices.map((dev: any) => (
              <div key={dev.id} className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-neutral-400">ID: #{dev.id}</span>
                <span className="text-white font-bold">{dev.ipv4}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-neutral-400"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={submitting}
              className="flex-1 bg-red-600 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              {submitting ? (
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCcw className="w-3.5 h-3.5" />
              )}
              Force_Overwrite
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
