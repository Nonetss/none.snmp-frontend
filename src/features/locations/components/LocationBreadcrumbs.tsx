import React from 'react'
import { ChevronRight } from 'lucide-react'
import type { Location } from '../types'

interface Props {
  breadcrumbs: Location[]
  onNavigate: (id: number | null) => void
}

export const LocationBreadcrumbs: React.FC<Props> = ({ breadcrumbs, onNavigate }) => {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
      <button onClick={() => onNavigate(null)} className="hover:text-white transition-colors">
        Root
      </button>

      {breadcrumbs.map((loc, idx) => (
        <React.Fragment key={loc.id}>
          <ChevronRight className="w-3 h-3" />
          <button
            onClick={() => onNavigate(loc.id)}
            className={`hover:text-white transition-colors ${idx === breadcrumbs.length - 1 ? 'text-white' : ''}`}
          >
            {loc.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}
