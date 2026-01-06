import React from 'react'
import ConnectionSearch from '@/features/search/ConnectionSearch'
import { Search } from 'lucide-react'

const SearchPage: React.FC = () => {
  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-12 w-full">
      {/* Header Page Title */}
      <div className="max-w-[1400px] mx-auto border-b border-white/10 pb-8 space-y-2">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-white" />
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            Network.Search_Engine
          </h1>
        </div>
        <p className="text-[10px] text-neutral-600 uppercase tracking-[0.5em]">
          Advanced diagnostics and device localization tools
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto">
        <ConnectionSearch />
      </div>
    </div>
  )
}

export default SearchPage
