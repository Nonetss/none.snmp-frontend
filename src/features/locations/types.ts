export interface Location {
  id: number
  name: string
  description: string | null
  parentId: number | null
  deviceCount?: number
}

export interface Subnet {
  id: number
  cidr: string
  name: string
  hasLocation?: boolean
  devices?: Device[]
}

export interface Device {
  id: number
  name: string | null
  ipv4: string
  sysName?: string | null
  sysLocation?: string | null
  hasLocation?: boolean
}

export interface DetailedLocation extends Location {
  subnets: Subnet[]
  children: Location[]
}
