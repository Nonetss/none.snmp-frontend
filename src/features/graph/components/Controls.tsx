import React from 'react'
import { Search, Minimize2, Maximize2, Settings2, RotateCcw } from 'lucide-react'

interface ControlsProps {
  searchQuery: string
  setSearchQuery: (v: string) => void
  isFullscreen: boolean
  toggleFullscreen: () => void
  showSettings: boolean
  setShowSettings: (v: boolean) => void
  onResetZoom: () => void
}

export const Controls: React.FC<ControlsProps> = ({
  searchQuery,
  setSearchQuery,
  isFullscreen,
  toggleFullscreen,
  showSettings,
  setShowSettings,
  onResetZoom,
}) => {
  return (
    <>
      {/* HUD Superior Overlay Title */}
      <div className="absolute top-6 left-6 z-40 pointer-events-none hidden md:flex flex-col gap-1 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          <h1 className="text-xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
            Topology.View
          </h1>
        </div>
      </div>

      {/* HUD Superior Controls */}
      <div className="absolute top-4 md:top-6 inset-x-0 z-30 flex justify-center items-start pointer-events-none font-mono px-2 md:px-0">
        <div className="flex flex-col gap-3 pointer-events-auto w-full md:max-w-md lg:max-w-2xl items-center ml-0 md:ml-0">
          <div className="flex items-center gap-2 bg-black/90 border border-white/20 p-1 shadow-lg w-full backdrop-blur-sm max-w-[90vw] md:max-w-none">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white text-xs font-bold leading-none">
                {'>'}
              </span>
              <input
                type="text"
                placeholder="search_query..."
                className="w-full pl-7 pr-3 py-2 bg-transparent border-none rounded-none text-[10px] md:text-xs text-white placeholder:text-neutral-600 focus:ring-0 uppercase outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border-l border-white/10 hidden md:block"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 pointer-events-auto fixed bottom-24 right-4 md:top-4 md:right-4 md:bottom-auto">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 border transition-all ${
              showSettings
                ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                : 'bg-black border-white/20 text-neutral-400 hover:border-white hover:text-white'
            }`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            onClick={onResetZoom}
            className="p-2 bg-black border border-white/20 text-neutral-400 hover:border-white hover:text-white transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )
}
