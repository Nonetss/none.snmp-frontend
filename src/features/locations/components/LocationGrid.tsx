import React from 'react'
import {
  MapPin,
  Link as LinkIcon,
  Edit2,
  Trash2,
  Database,
  Layers,
  ChevronRight,
} from 'lucide-react'
import type { Location } from '../types'

interface Props {
  locations: Location[]
  processedLocations: Location[]
  onNavigate: (id: number) => void
  onOpenAssign: (loc: Location, e: React.MouseEvent) => void
  onEdit: (loc: Location, e: React.MouseEvent) => void
  onDelete: (id: number, e: React.MouseEvent) => void
  getParentName: (parentId: number | null) => string | null
}

export const LocationGrid: React.FC<Props> = ({
  locations,
  processedLocations,
  onNavigate,
  onOpenAssign,
  onEdit,
  onDelete,
  getParentName,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
        Sub_Locations
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedLocations.map((loc) => (
          <div
            key={loc.id}
            onClick={() => onNavigate(loc.id)}
            className="group relative border border-white/10 bg-neutral-900/20 p-6 space-y-4 hover:border-white/30 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="px-2 py-1 bg-white/10 text-[9px] font-bold uppercase tracking-widest text-white">
                ID: {loc.id}
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => onOpenAssign(loc, e)}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                  title="Assign Subnets"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => onEdit(loc, e)}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                  title="Edit Location"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => onDelete(loc.id, e)}
                  className="p-1 text-neutral-500 hover:text-red-500 transition-colors"
                  title="Delete Location"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-bold font-mono uppercase">{loc.name}</span>
              </div>

              <p className="text-[10px] text-neutral-400 uppercase tracking-tight min-h-[2.5em] line-clamp-2">
                {loc.description || 'NO_DESCRIPTION'}
              </p>

              <div className="pt-4 border-t border-white/5 space-y-3">
                {loc.parentId && (
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase font-bold tracking-tighter">
                      Parent:{' '}
                      <span className="text-neutral-300">{getParentName(loc.parentId)}</span>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Database className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase font-bold">
                        {loc.deviceCount || 0} Devices
                      </span>
                    </div>

                    {locations.filter((l) => l.parentId === loc.id).length > 0 && (
                      <div className="flex items-center gap-2 text-emerald-500/70">
                        <Layers className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-bold">
                          {locations.filter((l) => l.parentId === loc.id).length} Sub-locations
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {locations.filter((l) => l.parentId === loc.id).length > 0 && (
                      <div className="px-1.5 py-0.5 border border-emerald-500/30 text-[8px] text-emerald-500 uppercase font-black animate-pulse">
                        Has_Children
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {processedLocations.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 p-12 text-center border border-dashed border-white/10 bg-neutral-900/5">
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">
              No sub-locations defined here
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
