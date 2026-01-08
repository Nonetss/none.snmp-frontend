export interface MonitoringGroup {
  id: number
  name: string
  description: string
  createdAt: string
  deviceCount?: number
  devices?: MonitoringDevice[]
}

export interface MonitoringDevice {
  id: number
  name: string | null
  ipv4: string
  sysName?: string | null
  macAddress?: string | null
  status?: boolean
  tags?: Array<{ id: number; name: string; color: string }>
  location?: { id: number; name: string } | null
  subnetId?: number
  subnetName?: string
}

export interface CreateMonitoringGroupDto {
  name: string
  description: string
  deviceIds?: number[]
}

export interface UpdateMonitoringGroupDto {
  name?: string
  description?: string
  deviceIds?: number[]
}
