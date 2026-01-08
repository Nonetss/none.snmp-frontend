import React from 'react'
import {
  X,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  MapPin,
  RefreshCcw,
  Link as LinkIcon,
} from 'lucide-react'
import type { Location, Subnet } from '../types'

interface Props {
  show: boolean
  selectedLocation: Location | null
  subnets: Subnet[]
  subnetSearchQuery: string
  onSubnetSearchChange: (val: string) => void
  expandedSubnets: number[]
  onToggleSubnet: (id: number) => void
  selectedSubnets: number[]
  onSelectSubnet: (id: number) => void
  selectedDeviceIds: number[]
  onSelectDevice: (id: number) => void
  forceAssign: boolean
  onToggleForce: () => void
  submitting: boolean
  onClose: () => void
  onSubmit: () => void
}

export const AssignDevicesModal: React.FC<Props> = ({
  show,
  selectedLocation,
  subnets,
  subnetSearchQuery,
  onSubnetSearchChange,
  expandedSubnets,
  onToggleSubnet,
  selectedSubnets,
  onSelectSubnet,
  selectedDeviceIds,
  onSelectDevice,
  forceAssign,
  onToggleForce,
  submitting,
  onClose,
  onSubmit,
}) => {
  if (!show || !selectedLocation) return null

  const query = subnetSearchQuery.toLowerCase()

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Assign.Devices.to.{selectedLocation.name}
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
          <div className="space-y-3">
            <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
              Select subnets to assign all their devices to this location:
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500" />
              <input
                type="text"
                placeholder="Search subnets or IPs..."
                value={subnetSearchQuery}
                onChange={(e) => onSubnetSearchChange(e.target.value)}
                className="w-full bg-black border border-white/10 px-9 py-2 text-[10px] focus:outline-none focus:border-white/30 uppercase font-mono"
              />
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {subnets
              .filter((s) => {
                const subnetMatches =
                  s.cidr.toLowerCase().includes(query) ||
                  (s.name?.toLowerCase().includes(query) ?? false)
                const deviceMatches = s.devices?.some(
                  (d) =>
                    (d.name?.toLowerCase().includes(query) ?? false) ||
                    d.ipv4.toLowerCase().includes(query)
                )
                return subnetMatches || deviceMatches
              })
              .map((s) => {
                const isExpanded =
                  expandedSubnets.includes(s.id) ||
                  (query !== '' &&
                    s.devices?.some(
                      (d) =>
                        (d.name?.toLowerCase().includes(query) ?? false) ||
                        d.ipv4.toLowerCase().includes(query)
                    ))

                return (
                  <div key={s.id} className="space-y-1">
                    <div
                      className={`w-full flex items-center justify-between p-3 border transition-all cursor-pointer ${
                        selectedSubnets.includes(s.id)
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-black border-white/10 text-neutral-500 hover:border-white/20'
                      }`}
                      onClick={() => onSelectSubnet(s.id)}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleSubnet(s.id)
                          }}
                          className="p-1 hover:bg-white/10 text-neutral-600 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono">{s.cidr}</span>
                            {s.hasLocation && (
                              <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1 font-black uppercase tracking-tighter border border-amber-500/20">
                                Has_Assigned
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] uppercase opacity-60">{s.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono opacity-40">
                          {s.devices?.length || 0} DEVS
                        </span>
                        {selectedSubnets.includes(s.id) && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="ml-8 border-l border-white/10 pl-4 py-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
                        {s.devices
                          ?.filter((dev) => {
                            if (query === '') return true
                            const subnetMatches =
                              s.cidr.toLowerCase().includes(query) ||
                              (s.name?.toLowerCase().includes(query) ?? false)
                            if (subnetMatches) return true
                            return (
                              (dev.name?.toLowerCase().includes(query) ?? false) ||
                              dev.ipv4.toLowerCase().includes(query)
                            )
                          })
                          .map((dev: any) => (
                            <div
                              key={dev.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                onSelectDevice(dev.id)
                              }}
                              className={`flex items-center justify-between py-1.5 px-2 border-b border-white/[0.02] cursor-pointer transition-colors ${
                                selectedDeviceIds.includes(dev.id)
                                  ? 'bg-white/5'
                                  : 'hover:bg-white/[0.02]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-3.5 h-3.5 border transition-all flex items-center justify-center ${
                                    selectedDeviceIds.includes(dev.id)
                                      ? 'bg-white border-white'
                                      : 'border-white/20'
                                  }`}
                                >
                                  {selectedDeviceIds.includes(dev.id) && (
                                    <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-tight ${
                                      query !== '' &&
                                      (dev.name?.toLowerCase().includes(query) ?? false)
                                        ? 'text-white'
                                        : 'text-neutral-300'
                                    }`}
                                  >
                                    {dev.name || 'Unknown'}
                                  </span>
                                  <span
                                    className={`text-[9px] font-mono ${
                                      query !== '' && dev.ipv4.toLowerCase().includes(query)
                                        ? 'text-white'
                                        : 'text-neutral-600'
                                    }`}
                                  >
                                    {dev.ipv4}
                                  </span>
                                </div>
                              </div>
                              {dev.hasLocation && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 text-amber-500/50" />
                                  <span className="text-[7px] text-amber-500/50 uppercase font-black">
                                    Located
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        {(!s.devices || s.devices.length === 0) && (
                          <div className="text-[9px] text-neutral-700 uppercase italic py-2">
                            No devices found in this subnet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-neutral-600 border-b border-white/5 pb-2">
              <span>Selection_Summary:</span>
              <div className="flex gap-4">
                <span>{selectedSubnets.length} Subnets</span>
                <span>{selectedDeviceIds.length} Individual Devices</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onToggleForce}
                className={`w-5 h-5 border flex items-center justify-center transition-all ${
                  forceAssign ? 'bg-white border-white' : 'bg-black border-white/20'
                }`}
              >
                {forceAssign && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
              </button>
              <span
                className="text-[10px] uppercase font-bold text-neutral-400 cursor-pointer select-none"
                onClick={onToggleForce}
              >
                Force overwrite existing locations
              </span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onSubmit()}
              disabled={
                submitting || (selectedSubnets.length === 0 && selectedDeviceIds.length === 0)
              }
              className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <RefreshCcw className="w-4 h-4 animate-spin" />}
              {submitting
                ? 'Assigning...'
                : `Assign ${selectedSubnets.length} Subnets & ${selectedDeviceIds.length} Devs`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
