export type TabId =
  | 'dashboard'
  | 'interfaces'
  | 'network'
  | 'bridge'
  | 'discovery'
  | 'inventory'
  | 'services'
  | 'applications'
  | 'hikvision'

export type DeviceDetail = Root2

export interface Root2 {
  id: number
  ipv4: string
  name: string
  subnetId: number
  snmpAuthId: number
  pingable?: boolean
  subnet: Subnet
  snmpAuth: SnmpAuth
  system: System
  interfaces: Interface[]
  ipSnmp: IpSnmp
  neighbor_discovery: NeighborDiscovery
  routes: Route[]
  physicalEntities: PhysicalEntity[]
  resources: Resource[]
  applications: Application[]
  services: Service[]
  bridge: Bridge
  hikvision?: Hikvision | null
  tags?: Array<{ id: number; name: string; color: string }>
  location?: {
    id: number
    name: string
    description: string | null
    parentId: number | null
  } | null
}

export interface Hikvision {
  id: number
  deviceId: number
  hikIp?: string | null
  hikPort?: number | null
  hikEntityIndex?: number | null
  hikEntityType?: number | null
  hikEntitySubType?: number | null
  hikOnline?: number | null
  hikService?: number | null
  hikCMSDefType?: number | null
  hikObjectID?: string | null
  hikObjectName?: string | null
  hikTrapHostIp1?: string | null
  hikCPUNum?: number | null
  hikCPUFrequency?: number | null
  hikMemoryCapability?: number | null
  hikMemoryUsage?: number | null
  hikDeviceStatus?: number | null
  hikDeviceLanguage?: number | null
  hikDiskNum?: number | null
  deviceType?: string | null
  hardwVersion?: string | null
  softwVersion?: string | null
  macAddr?: string | null
  deviceID?: string | null
  manufacturer?: string | null
  cpuPercent?: string | null
  diskSize?: string | null
  diskPercent?: string | null
  memSize?: string | null
  memUsed?: string | null
  restartDev?: number | null
  dynIpAddr?: string | null
  dynNetMask?: string | null
  dynGateway?: string | null
  staticIpAddr?: string | null
  staticNetMask?: string | null
  staticGateway?: string | null
  sysTime?: string | null
  videoInChanNum?: number | null
  videoEncode?: string | null
  videoNetTrans?: string | null
  audioAbility?: number | null
  audioInNum?: number | null
  videoOutNum?: number | null
  clarityChanNum?: number | null
  localStorage?: number | null
  rtspPlayBack?: number | null
  netAccessType?: string | null
  alarmInChanNum?: number | null
  alarmOutChanNum?: number | null
  manageServAddr?: string | null
  ntpServIpAddr?: string | null
  managePort?: number | null
}

export interface Subnet {
  id: number
  cidr: string
  name: string
}

export interface SnmpAuth {
  id: number
  version: string
  port: number
  community: string
  v3User: any
  v3AuthProtocol: any
  v3AuthKey: any
  v3PrivProtocol: any
  v3PrivKey: any
  v3Level: any
}

export interface System {
  id: number
  deviceId: number
  sysDescr: string
  sysUpTime: string
  sysContact: string
  sysName: string
  sysLocation: string
  sysServices: number
}

export interface Interface {
  id: number
  deviceId: number
  ifIndex: number
  ifDescr: string
  ifName: string
  ifType: number
  ifMtu?: number
  ifSpeed: string
  ifPhysAddress?: string
  updatedAt: string
  latestData: LatestData
}

export interface LatestData {
  interfaceId: number
  time: string
  ifAdminStatus: number
  ifOperStatus: number
  ifInOctets: string
  ifOutOctets: string
  ifInErrors: any
  ifOutErrors: any
}

export interface IpSnmp {
  addrEntries: AddrEntry[]
  netToMediaEntries: NetToMediaEntry[]
}

export interface AddrEntry {
  ipSnmpId: number
  time: string
  ipAdEntAddr: string
  ipAdEntIfIndex: number
  ipAdEntNetMask: string
  ipAdEntBcastAddr: string
  ipAdEntReasmMaxSize: number
}

export interface NetToMediaEntry {
  ipSnmpId: number
  time: string
  ipNetToMediaIfIndex: number
  ipNetToMediaPhysAddress: string
  ipNetToMediaNetAddress: string
  ipNetToMediaType: number
}

export interface NeighborDiscovery {
  outbound: Outbound[]
  inbound: Inbound[]
}

export interface Outbound {
  id: number
  deviceId: number
  interfaceId?: number
  localPortNum?: number
  neighborIndex: number
  chassisIdSubtype?: number
  chassisId?: string
  portIdSubtype?: number
  portId?: string
  portDesc?: string
  sysName?: string
  sysDesc?: string
  sysCapSupported?: string
  sysCapEnabled?: string
  mgmtAddress?: string
  remoteDeviceId?: number
  remoteInterfaceId?: number
  updatedAt: string
  protocol: string
  remoteDeviceName?: string
  ifIndex?: number
  address?: string
  neighborDeviceId?: string
  neighborPort?: string
  neighborPlatform?: string
  neighborSysName: any
}

export interface Inbound {
  id: number
  deviceId: number
  interfaceId: number
  localPortNum: number
  neighborIndex: number
  chassisIdSubtype: number
  chassisId: string
  portIdSubtype: number
  portId: string
  portDesc: string
  sysName: string
  sysDesc: string
  sysCapSupported: string
  sysCapEnabled: string
  mgmtAddress: string
  remoteDeviceId: number
  remoteInterfaceId: any
  updatedAt: string
  protocol: string
  remoteDeviceName: string
}

export interface Route {
  id: number
  deviceId: number
  dest: string
  mask: string
  pfxLen: any
  nextHop: string
  ifIndex: number
  type: number
  proto: number
  age: number
  metric1: number
  metric2: any
  metric3: any
  metric4: any
  metric5: any
  updatedAt: string
}

export interface PhysicalEntity {
  id: number
  deviceId: number
  physicalIndex: number
  descr: string
  vendorType: string
  containedIn: number
  class: number
  parentRelPos: number
  name: string
  hardwareRev: string
  firmwareRev: string
  softwareRev: string
  serialNum: string
  mfgName: string
  modelName: string
  alias: string
  assetId: string
  isFru: number
  updatedAt: string
}

export interface Resource {
  id: number
  deviceId: number
  name: string
  type: string
  value: string
  swInstalled: SwInstalled[]
  swRun: SwRun[]
  swRunPerf: SwRunPerf[]
}

export interface SwInstalled {
  id: number
  resourceId: number
  date: string
  hrSWInstalledIndex: number
  hrSWInstalledName: string
  hrSWInstalledID: string
  hrSWInstalledType: number
  hrSWInstalledDate: string
}

export interface SwRun {
  id: number
  resourceId: number
  date: string
  hrSWRunIndex: number
  hrSWRunName: string
  hrSWRunID: string
  hrSWRunPath: string
  hrSWRunParameters: string
  hrSWRunType: number
  hrSWRunStatus: number
}

export interface SwRunPerf {
  id: number
  resourceId: number
  date: string
  hrSWRunIndex: number
  hrSWRunPerfCPU: number
  hrSWRunPerfMem: number
}

export interface Application {
  id: number
  resourceId: number
  date: string
  hrSWInstalledIndex: number
  hrSWInstalledName: string
  hrSWInstalledID: string
  hrSWInstalledType: number
  hrSWInstalledDate: string
}

export interface Service {
  id: number
  resourceId: number
  date: string
  hrSWRunIndex: number
  hrSWRunName: string
  hrSWRunID: string
  hrSWRunPath: string
  hrSWRunParameters: string
  hrSWRunType: number
  hrSWRunStatus: number
}

export interface Bridge {
  base: Base
  ports: Port[]
  fdb: Fdb[]
  fdbQ: FdbQ[]
  vlans: Vlan[]
}

export interface Base {
  id: number
  deviceId: number
  bridgeAddress: string
  numPorts: number
  type: number
  updatedAt: string
}

export interface Port {
  id: number
  deviceId: number
  bridgePort: number
  ifIndex: number
  pvid: number
  updatedAt: string
}

export interface Fdb {
  id: number
  deviceId: number
  address: string
  port: number
  status: number
  updatedAt: string
}

export interface FdbQ {
  id: number
  deviceId: number
  vlanId: number
  address: string
  port: number
  status: number
  updatedAt: string
}

export interface Vlan {
  id: number
  deviceId: number
  vlanId: number
  name: string
  egressPorts: string
  untaggedPorts: string
  updatedAt: string
}
