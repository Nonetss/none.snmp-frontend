import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorScreenProps {
  error: string
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ error }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white font-mono">
      <div className="bg-neutral-900/50 p-8 border border-white/20 flex flex-col items-center shadow-[0_0_30px_rgba(255,255,255,0.05)]">
        <AlertCircle className="w-10 h-10 text-white mb-4" />
        <h2 className="font-bold text-sm uppercase tracking-widest mb-2">CRITICAL_FAILURE</h2>
        <p className="text-neutral-400 text-xs mb-6 text-center max-w-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all uppercase tracking-tighter"
        >
          Reconnect.System()
        </button>
      </div>
    </div>
  )
}
