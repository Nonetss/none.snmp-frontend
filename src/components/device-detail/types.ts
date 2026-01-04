export type TabId = "dashboard" | "interfaces" | "network" | "discovery" | "inventory" | "services" | "applications";

export type DeviceDetail = Root2;

export interface Root2 {
  id: number;
  ipv4: string;
  name: string;
  subnetId: number;
  snmpAuthId: number;
  subnet: Subnet;
  snmpAuth: SnmpAuth;
  system: System;
  interfaces: Interface[];
  ipSnmp: IpSnmp;
  neighbor_discovery: NeighborDiscovery;
  routes: any[];
  physicalEntities: any[];
  resources: Resource[];
  applications: Application[];
  services: Service[];
  bridge: Bridge;
}

export interface Subnet {
  id: number;
  cidr: string;
  name: string;
}

export interface SnmpAuth {
  id: number;
  version: string;
  port: number;
  community: string;
  v3User: any;
  v3AuthProtocol: any;
  v3AuthKey: any;
  v3PrivProtocol: any;
  v3PrivKey: any;
  v3Level: any;
}

export interface System {
  id: number;
  deviceId: number;
  sysDescr: string;
  sysUpTime: string;
  sysContact: string;
  sysName: string;
  sysLocation: string;
  sysServices: number;
}

export interface Interface {
  id: number;
  deviceId: number;
  ifIndex: number;
  ifDescr: string;
  ifName: string;
  ifType: number;
  ifMtu?: number;
  ifSpeed: string;
  ifPhysAddress?: string;
  updatedAt: string;
  latestData: LatestData;
}

export interface LatestData {
  interfaceId: number;
  time: string;
  ifAdminStatus: number;
  ifOperStatus: number;
  ifInOctets: string;
  ifOutOctets: string;
  ifInErrors: any;
  ifOutErrors: any;
}

export interface IpSnmp {
  addrEntries: AddrEntry[];
  netToMediaEntries: NetToMediaEntry[];
}

export interface AddrEntry {
  ipSnmpId: number;
  time: string;
  ipAdEntAddr: string;
  ipAdEntIfIndex: number;
  ipAdEntNetMask: string;
  ipAdEntBcastAddr: string;
  ipAdEntReasmMaxSize: number;
}

export interface NetToMediaEntry {
  ipSnmpId: number;
  time: string;
  ipNetToMediaIfIndex: number;
  ipNetToMediaPhysAddress: string;
  ipNetToMediaNetAddress: string;
  ipNetToMediaType: number;
}

export interface NeighborDiscovery {
  outbound: any[];
  inbound: any[];
}

export interface Resource {
  id: number;
  deviceId: number;
  name: string;
  type: string;
  value: string;
  swInstalled: SwInstalled[];
  swRun: SwRun[];
  swRunPerf: SwRunPerf[];
}

export interface SwInstalled {
  id: number;
  resourceId: number;
  date: string;
  hrSWInstalledIndex: number;
  hrSWInstalledName: string;
  hrSWInstalledID: string;
  hrSWInstalledType: number;
  hrSWInstalledDate: string;
}

export interface SwRun {
  id: number;
  resourceId: number;
  date: string;
  hrSWRunIndex: number;
  hrSWRunName: string;
  hrSWRunID: string;
  hrSWRunPath: string;
  hrSWRunParameters: string;
  hrSWRunType: number;
  hrSWRunStatus: number;
}

export interface SwRunPerf {
  id: number;
  resourceId: number;
  date: string;
  hrSWRunIndex: number;
  hrSWRunPerfCPU: number;
  hrSWRunPerfMem: number;
}

export interface Application {
  id: number;
  resourceId: number;
  date: string;
  hrSWInstalledIndex: number;
  hrSWInstalledName: string;
  hrSWInstalledID: string;
  hrSWInstalledType: number;
  hrSWInstalledDate: string;
}

export interface Service {
  id: number;
  resourceId: number;
  date: string;
  hrSWRunIndex: number;
  hrSWRunName: string;
  hrSWRunID: string;
  hrSWRunPath: string;
  hrSWRunParameters: string;
  hrSWRunType: number;
  hrSWRunStatus: number;
}

export interface Bridge {
  base: Base;
  ports: any[];
  fdb: any[];
  fdbQ: any[];
  vlans: any[];
}

export interface Base {
  id: number;
  deviceId: number;
  bridgeAddress: any;
  numPorts: number;
  type: number;
  updatedAt: string;
}