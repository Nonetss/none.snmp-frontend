export interface NodeDetails {
  system?: {
    sysDescr?: string
    sysName?: string
    sysLocation?: string
    sysContact?: string
  }
  interfaces?: Interface[]
}

export interface Interface {
  ifIndex: number
  ifName: string
  ifDescr: string
  ifSpeed?: number
  ifAdminStatus?: number // 1 = Up/Active
}

export interface GraphNode {
  id: string
  label?: string
  type?: 'port' | 'device' | string
  parentId?: string
  details?: NodeDetails
  ip?: string
  x?: number
  y?: number
  [key: string]: any
}

export interface GraphEdge {
  source: string | GraphNode
  target: string | GraphNode
  type?: string
  metadata?: {
    sourceInterface?: Interface | string
    targetInterface?: Interface | string
  }
  [key: string]: any
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
