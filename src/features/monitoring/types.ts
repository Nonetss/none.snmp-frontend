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

export interface PortGroup {
  id: number
  name: string
  description: string
  items?: PortGroupItem[]
}

export interface PortGroupItem {
  id?: number
  port: number
  expectedStatus: boolean
}

export interface MonitoringRule {
  id: number
  name: string
  deviceGroupId: number
  portGroupId: number
  enabled: boolean
  cronExpression: string
  deviceGroup?: MonitoringGroup
  portGroup?: PortGroup
  lastRun?: string | null
  nextRun?: string | null
  status?: string
  lastResult?: any
  condition?: string
}

export interface MonitoringStatusPoint {
  status: boolean
  checkTime: string
  responseTime?: number | null
}

export interface MonitoringDeviceDataPort {
  port: number
  statusData: MonitoringStatusPoint[]
}

export interface MonitoringGroupedData {
  deviceId: number
  deviceDataPort: MonitoringDeviceDataPort[]
}

export interface MonitoringStatusResponse {
  rule: MonitoringRule
  groupedData: MonitoringGroupedData[]
}

export interface MonitoringStatusHistory {
  checkTime: string
  status: boolean
  responseTime: number | null
}

export interface MonitoringStatusDevice {
  id: number
  name: string
  ipv4: string
  history: MonitoringStatusHistory[]
}

export interface MonitoringStatusPort {
  portGroupItemId: number
  port: number
  expectedStatus: boolean
  devices: MonitoringStatusDevice[]
}

export interface MonitoringStatusRule {
  id: number
  name: string
  enabled: boolean
  cronExpression: string
  lastRun: string | null
  status: string
  ports: MonitoringStatusPort[]
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
