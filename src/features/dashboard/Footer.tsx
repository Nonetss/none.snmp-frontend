import React from 'react'

export const Footer: React.FC = () => (
  <div className="border border-white/10 p-4 flex justify-between items-center bg-white/[0.02]">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase tracking-[0.2em]">
        <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> Data.Ingestion: Active
      </div>
      <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase tracking-[0.2em]">
        <span className="w-1 h-1 rounded-full bg-white" /> Backend_Node: Connected
      </div>
    </div>
    <div className="text-[10px] text-neutral-500 uppercase tracking-widest italic font-medium">
      "Monitoring the unseen, one packet at a time."
    </div>
  </div>
)
