import React from 'react'
import { Activity } from 'lucide-react'

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white font-mono">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-8 h-8 text-white animate-pulse" />
        <div className="space-y-1 text-center">
          <h2 className="font-bold tracking-[0.3em] text-xs uppercase text-white">
            System.Initialize()
          </h2>
          <p className="text-neutral-500 text-[9px] uppercase tracking-tighter">
            Fetching topology from endpoint...
          </p>
        </div>
      </div>
    </div>
  )
}
