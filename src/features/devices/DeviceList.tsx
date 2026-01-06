import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Server,
  Search,
  MapPin,
  Cpu,
  RefreshCcw,
  AlertCircle,
  ChevronRight,
  Filter,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react'

interface Device {
  id: number
  name: string | null
  ipv4: string
  sysName: string | null
  sysLocation: string | null
  sysDescr: string | null
  macAddress: string | null
}

interface SubnetWithDevices {
  id: number
  cidr: string
  name: string | null
  devices: Device[]
}

const DeviceList: React.FC = () => {
  const [data, setData] = useState<SubnetWithDevices[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSubnets, setExpandedSubnets] = useState<Record<number, boolean>>({})

  const fetchDevices = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.PUBLIC_BACKEND_URL}/api/v1/search/device/list`
      )
      setData(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch devices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const toggleSubnet = (id: number) => {
    setExpandedSubnets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const processedData = useMemo(() => {
    if (!searchQuery) return data

    const query = searchQuery.toLowerCase()
    return data
      .map((subnet) => ({
        ...subnet,
        devices: subnet.devices.filter(
          (device) =>
            device.ipv4.toLowerCase().includes(query) ||
            (device.name?.toLowerCase().includes(query) ?? false) ||
            (device.sysName?.toLowerCase().includes(query) ?? false) ||
            (device.sysLocation?.toLowerCase().includes(query) ?? false) ||
            (device.sysDescr?.toLowerCase().includes(query) ?? false) ||
            (device.macAddress?.toLowerCase().includes(query) ?? false)
        ),
      }))
      .filter((subnet) => subnet.devices.length > 0)
  }, [data, searchQuery])

  // Auto-expand on search
  useEffect(() => {
    if (searchQuery) {
      const newExpanded: Record<number, boolean> = {}
      processedData.forEach((s) => {
        newExpanded[s.id] = true
      })
      setExpandedSubnets(newExpanded)
    }
  }, [searchQuery, processedData])

  const totalDevices = useMemo(() => {
    return data.reduce((acc, subnet) => acc + subnet.devices.length, 0)
  }, [data])

  if (loading)
    return (
      <div className="flex items-center justify-center h-full bg-black text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-white" />
          <span className="text-[10px] tracking-[0.3em] uppercase">Inventory.Loading()</span>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="p-8 text-white font-mono bg-black">
        <div className="border border-white/20 p-6 flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-white" />
          <p className="text-xs uppercase tracking-widest">{error}</p>
          <button
            onClick={fetchDevices}
            className="px-4 py-2 border border-white text-xs hover:bg-white hover:text-black transition-all"
          >
            RETRY.INVENTORY()
          </button>
        </div>
      </div>
    )

  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full max-w-[1600px]">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Device.Inventory</h1>
          </div>
          <p className="text-[11px] text-neutral-400 uppercase tracking-[0.4em]">
            Total discovered units: {totalDevices} across {data.length} subnets
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="SEARCH_DEVICES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 w-64 uppercase placeholder:text-neutral-500"
            />
          </div>
          <button
            onClick={fetchDevices}
            className="p-2 border border-white/10 hover:bg-white hover:text-black transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Subnet Sections */}
      <div className="space-y-4">
        {processedData.map((subnet) => (
          <div key={subnet.id} className="border border-white/10 bg-neutral-900/10 overflow-hidden">
            {/* Subnet Header */}
            <button
              onClick={() => toggleSubnet(subnet.id)}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors border-b border-white/10 group"
            >
              <div className="flex items-center gap-4">
                <Globe className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                <div className="text-left">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">
                    {subnet.name || `Subnet_${subnet.id}`}
                  </span>
                  <span className="ml-3 text-[10px] text-neutral-500 font-mono">{subnet.cidr}</span>
                </div>
                <span className="px-2 py-0.5 bg-white/5 text-[8px] text-neutral-500 uppercase font-bold border border-white/5">
                  {subnet.devices.length} Units
                </span>
              </div>
              {expandedSubnets[subnet.id] ? (
                <ChevronUp className="w-4 h-4 text-neutral-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-600" />
              )}
            </button>

            {/* Devices Table (Collapsible Content) */}
            {expandedSubnets[subnet.id] && (
              <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-black/40">
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 w-16">
                        ID
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Device_Identity
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Network_Address
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Location
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hidden lg:table-cell">
                        System_Specs
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subnet.devices.map((device) => (
                      <tr key={device.id} className="hover:bg-white/[0.02] group transition-colors">
                        <td className="p-4 text-[11px] text-neutral-500 font-bold">#{device.id}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider group-hover:text-white transition-colors">
                              {device.name || device.sysName || 'UNKNOWN_NODE'}
                            </span>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-tighter">
                              {device.macAddress || 'NO_MAC_ADDR'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white group-hover:animate-pulse transition-all" />
                            <span className="text-xs font-bold text-neutral-400 group-hover:text-neutral-300 font-mono transition-colors">
                              {device.ipv4}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500 uppercase">
                            <MapPin className="w-3 h-3" />
                            <span>{device.sysLocation || 'NOT_DEFINED'}</span>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell max-w-xs">
                          <div className="flex items-start gap-2">
                            <Cpu className="w-3 h-3 mt-0.5 text-neutral-600 shrink-0" />
                            <p className="text-[10px] text-neutral-500 line-clamp-1 uppercase italic group-hover:text-neutral-400 transition-colors">
                              {device.sysDescr || 'No system description available.'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`/devices/${device.id}`}
                            className="inline-block p-1.5 border border-white/5 text-neutral-700 hover:text-white hover:border-white/40 transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {processedData.length === 0 && (
          <div className="p-12 text-center border border-white/10 bg-neutral-900/5">
            <div className="flex flex-col items-center gap-3 opacity-30">
              <Filter className="w-8 h-8" />
              <span className="text-[10px] uppercase tracking-[0.3em]">No_Devices_Match_Query</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer System Info */}
      <div className="flex justify-between items-center text-[8px] text-neutral-700 uppercase tracking-widest border-t border-white/10 pt-4">
        <div className="flex items-center gap-4">
          <span>Buffer_Status: Optimized</span>
          <span>Security_Level: Root</span>
        </div>
        <div>Last Sync: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  )
}

export default DeviceList
