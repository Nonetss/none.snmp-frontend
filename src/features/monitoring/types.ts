export interface DeviceStatus {
  deviceId: number
  status: boolean
  lastPing: string | null
  lastPingUp: string | null
}

export interface MonitoringDevice {
  id: number
  name: string | null
  ipv4: string
  sysName?: string | null
  macAddress?: string | null
  status?: DeviceStatus | boolean
  tags?: Array<{ id: number; name: string; color: string }>
  location?: { id: number; name: string } | null
  subnetId?: number
  subnetName?: string
}

export interface MonitoringGroupDevice {
  groupId: number
  deviceId: number
  device: MonitoringDevice
}

export interface MonitoringGroup {
  id: number
  name: string
  description: string
  createdAt: string
  deviceCount?: number
  devices?: MonitoringGroupDevice[]
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

export interface TcpScanRequest {
  ip: string
  allPorts?: boolean
  timeout?: number
  concurrency?: number
}

export interface TcpScanResponse {
  ip: string
  openPorts: Array<{
    port: number
    time: number
  }>
  totalScanned: number
}

export interface TcpSubnetScanRequest {
  subnet: string
  allPorts?: boolean
  timeout?: number
  concurrency?: number
}

export interface TcpSubnetScanResponse {
  subnet: string
  results: Array<{
    ip: string
    openPorts: Array<{
      port: number
      time: number
    }>
  }>
  totalIpsScanned: number
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

export interface NtfyTopic {
  id: number
  topic: string
  url: string
  description?: string
}

export interface NtfyAction {
  id: number
  notificationActionId: number
  ntfyTopicId: number
  title: string
  priority: number
  tags: string[]
  topic?: NtfyTopic
}

export interface NotificationAction {
  id: number
  monitorRuleId: number
  enabled: boolean
  type: string
  consecutiveFailures: number
  repeatIntervalMins: number
  deviceAggregation: 'any' | 'all' | 'percentage'
  deviceAggregationValue: number
  portAggregation: 'any' | 'all' | 'percentage'
  portAggregationValue: number
  monitorRule?: MonitoringRule
  ntfyAction?: NtfyAction
  lastSentAt?: string
}
