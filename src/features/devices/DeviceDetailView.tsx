import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { RefreshCcw, AlertCircle } from 'lucide-react'

import { Header } from '@/features/devices/components/Header'
import { TabsNav } from '@/features/devices/components/TabsNav'
import { DashboardTab } from '@/features/devices/components/DashboardTab'
import { InterfacesTab } from '@/features/devices/components/InterfacesTab'
import { NetworkTab } from '@/features/devices/components/NetworkTab'
import { DiscoveryTab } from '@/features/devices/components/DiscoveryTab'
import { InventoryTab } from '@/features/devices/components/InventoryTab'
import { BridgeTab } from '@/features/devices/components/BridgeTab'
import { ServicesTab } from '@/features/devices/components/ServicesTab'
import { ApplicationsTab } from '@/features/devices/components/ApplicationsTab'
import { HikvisionTab } from '@/features/devices/components/HikvisionTab'
import { LocationSelectorModal } from '@/features/devices/components/LocationSelectorModal'
import { TagSelectorModal } from '@/features/devices/components/TagSelectorModal'
import type { DeviceDetail, TabId } from '@/features/devices/components/types'

interface Props {
  deviceId: string
}

const DeviceDetailView: React.FC<Props> = ({ deviceId }) => {
  const [device, setDevice] = useState<DeviceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')

  // Location State
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [locSubmitting, setLocSubmitting] = useState(false)

  // Tag State
  const [showTagModal, setShowTagModal] = useState(false)
  const [tagSubmitting, setTagSubmitting] = useState(false)
  const [availableTags, setAvailableTags] = useState<any[]>([])

  const fetchDevice = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [devRes, tagsRes] = await Promise.all([
        axios.get(`/api/v0/search/device?id=${deviceId}`),
        axios.get('/api/v0/tag'),
      ])

      if (devRes.data && devRes.data.length > 0) {
        setDevice(devRes.data[0])
      } else {
        setError('Device not found.')
      }
      setAvailableTags(tagsRes.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch device details')
    } finally {
      setLoading(false)
    }
  }

  const handleFullPoll = async () => {
    setPolling(true)
    try {
      await axios.post(`/api/v0/snmp/device/poll/${deviceId}/all`)
      await fetchDevice(true)
    } catch (err: any) {
      console.error('Poll failed:', err)
      alert('CRITICAL_ERROR: SNMP_POLL_FAILED')
    } finally {
      setPolling(false)
    }
  }

  const handleAssignLocation = async (locationId: number | null, deviceIds: number[]) => {
    setLocSubmitting(true)
    try {
      await axios.patch('/api/v0/search/device/location', {
        deviceId: deviceIds[0],
        locationId: locationId,
      })
      setShowLocationModal(false)
      await fetchDevice(true)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Location update failed')
    } finally {
      setLocSubmitting(false)
    }
  }

  const handleAssignTags = async (deviceIds: number[], tagIds: number[]) => {
    setTagSubmitting(true)
    try {
      const currentIds = device?.tags?.map((t) => t.id) || []
      const toAssign = tagIds.filter((id) => !currentIds.includes(id))
      const toUnassign = currentIds.filter((id) => !tagIds.includes(id))

      if (toAssign.length > 0) {
        await axios.post('/api/v0/tag/assign', {
          deviceIds: deviceIds,
          tagIds: toAssign,
        })
      }

      if (toUnassign.length > 0) {
        await axios.post('/api/v0/tag/unassign', {
          deviceIds: deviceIds,
          tagIds: toUnassign,
        })
      }

      setShowTagModal(false)
      await fetchDevice(true)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tag assignment failed')
    } finally {
      setTagSubmitting(false)
    }
  }

  useEffect(() => {
    if (deviceId) fetchDevice()
  }, [deviceId])

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-white" />
          <span className="text-[10px] tracking-[0.3em] uppercase">
            Deep.Scanning(ID:{deviceId})
          </span>
        </div>
      </div>
    )

  if (error || !device)
    return (
      <div className="p-8 text-white font-mono bg-black h-full flex items-center justify-center">
        <div className="border border-white/20 p-8 flex flex-col items-center gap-4 max-w-md">
          <AlertCircle className="w-10 h-10 text-white" />
          <p className="text-xs uppercase tracking-widest text-center">
            {error || 'CRITICAL_ERROR: NODE_NOT_FOUND'}
          </p>
          <a
            href="/devices"
            className="mt-4 px-6 py-2 border border-white text-xs hover:bg-white hover:text-black transition-all uppercase"
          >
            Back.To.Inventory()
          </a>
        </div>
      </div>
    )

  const hasNeighbors =
    device.neighbor_discovery?.outbound?.length > 0 ||
    device.neighbor_discovery?.inbound?.length > 0

  const hasHikvision = !!device.hikvision

  return (
    <div className="bg-black text-white font-mono min-h-screen w-full flex flex-col">
      <Header
        device={device}
        polling={polling}
        onFullPoll={handleFullPoll}
        onRescan={() => fetchDevice()}
        onEditLocation={() => setShowLocationModal(true)}
        onEditTags={() => setShowTagModal(true)}
      />

      <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} hasHikvision={hasHikvision} />

      <div className="p-4 md:p-8 space-y-8 max-w-full 2xl:max-w-[2400px] mx-auto w-full flex-grow">
        {activeTab === 'dashboard' && (
          <DashboardTab
            device={device}
            setActiveTab={setActiveTab}
            hasNeighbors={hasNeighbors}
            onEditLocation={() => setShowLocationModal(true)}
          />
        )}
        {activeTab === 'interfaces' && <InterfacesTab device={device} />}
        {activeTab === 'network' && <NetworkTab device={device} />}
        {activeTab === 'bridge' && <BridgeTab device={device} />}
        {activeTab === 'discovery' && <DiscoveryTab device={device} />}
        {activeTab === 'inventory' && <InventoryTab device={device} />}
        {activeTab === 'services' && <ServicesTab device={device} />}
        {activeTab === 'applications' && <ApplicationsTab device={device} />}
        {activeTab === 'hikvision' && <HikvisionTab device={device} />}
      </div>

      <LocationSelectorModal
        show={showLocationModal}
        deviceIds={[device.id]}
        deviceName={device.name || device.ipv4}
        currentLocationId={device.location?.id || null}
        submitting={locSubmitting}
        onClose={() => setShowLocationModal(false)}
        onAssign={handleAssignLocation}
      />

      <TagSelectorModal
        show={showTagModal}
        deviceIds={[device.id]}
        deviceName={device.name || device.ipv4}
        availableTags={availableTags}
        currentTagIds={device.tags?.map((t) => t.id) || []}
        submitting={tagSubmitting}
        onClose={() => setShowTagModal(false)}
        onAssign={handleAssignTags}
        onTagCreated={async () => {
          await fetchDevice(true)
        }}
      />
    </div>
  )
}

export default DeviceDetailView
