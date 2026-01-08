import React, { useState, useEffect, useMemo } from 'react'
import { X, Search, Check, Server, RefreshCcw, Shield } from 'lucide-react'
import axios from 'axios'
import type { MonitoringGroup, MonitoringDevice } from '../types'

interface Props {
  group: MonitoringGroup
  onClose: () => void
}

export const MonitoringGroupDevicesModal: React.FC<Props> = ({ group, onClose }) => {
  const [allDevices, setAllDevices] = useState<MonitoringDevice[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>(group.devices?.map((d) => d.id) || [])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('/api/v0/search/device/list')
        // Flatten the subnet structure to get all devices
        const flattened: MonitoringDevice[] = response.data.flatMap((subnet: any) =>
          subnet.devices.map((d: any) => ({
            id: d.id,
            name: d.name,
            ipv4: d.ipv4,
            sysName: d.sysName,
            status: d.status,
          }))
        )
        setAllDevices(flattened)
      } catch (err) {
        console.error('Failed to fetch devices', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDevices()
  }, [])

  const filteredDevices = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return allDevices.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.ipv4.includes(q) ||
        d.sysName?.toLowerCase().includes(q)
    )
  }, [allDevices, searchQuery])

  const toggleDevice = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      // We use PATCH to update the group's devices
      await axios.patch(`/api/v0/monitor/group/${group.id}`, {
        deviceIds: selectedIds,
      })
      onClose()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update group devices')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-widest truncate">
              Manage_Devices: {group.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="SEARCH_BY_NAME_OR_IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white/10 px-10 py-3 text-xs focus:outline-none focus:border-white/30 uppercase font-mono"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <RefreshCcw className="w-6 h-6 animate-spin text-neutral-700" />
                <span className="text-[10px] uppercase tracking-widest text-neutral-700">
                  Loading_Inventory
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => toggleDevice(device.id)}
                    className={`flex flex-col p-3 border text-left transition-all ${
                      selectedIds.includes(device.id)
                        ? 'bg-white/10 border-white/30'
                        : 'bg-black border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${device.status ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}
                        />
                        <span
                          className={`text-[10px] font-black uppercase tracking-tight ${selectedIds.includes(device.id) ? 'text-white' : 'text-neutral-400'}`}
                        >
                          {device.name || 'UNKNOWN_HOST'}
                        </span>
                      </div>
                      {selectedIds.includes(device.id) && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div className="text-[9px] text-neutral-500 font-mono flex items-center gap-2">
                      <span className="bg-white/5 px-1">{device.ipv4}</span>
                      {device.sysName && (
                        <span className="truncate opacity-50">/ {device.sysName}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!loading && filteredDevices.length === 0 && (
              <div className="py-20 text-center">
                <span className="text-[10px] text-neutral-600 uppercase tracking-widest">
                  No devices matching search
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            {selectedIds.length} Devices Selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-neutral-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-8 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <RefreshCcw className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              Save_Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
