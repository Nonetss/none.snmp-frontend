export interface DashboardStats {
  devices: {
    totalManaged: number
    totalExternal: number
    up: number
    down: number
  }
  topology: {
    resolvedLinks: number
    lldpConnections: number
    cdpConnections: number
  }
  network: {
    totalIps: number
    subnets: number
  }
  activity: {
    updatedNeighbors24h: number
    arpDiscoveries24h: number
  }
  snmpVersionDistribution: Array<{
    version: string
    deviceCount: number
  }>
  subnetsDistribution: Array<{
    cidr: string
    deviceCount: number
    upCount: number
    downCount: number
    subnetName?: string
  }>
  interfaceStatus: {
    up: number
    down: number
    other: number
  }
  topHubs: Array<{
    name: string
    connections: number
  }>
}
