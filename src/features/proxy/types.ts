export interface PangolinTarget {
  targetId: number
  ip: string
  port: number
  enabled: boolean
  healthStatus: string
}

export interface PangolinItem {
  resourceId: number
  niceId: string
  name: string
  ssl: boolean
  fullDomain: string
  passwordId: number | null
  sso: boolean
  pincodeId: number | null
  whitelist: boolean
  http: boolean
  protocol: string
  proxyPort: number | null
  enabled: boolean
  domainId: string
  headerAuthId: number | null
  targets: PangolinTarget[]
}

export interface NpmProxyHost {
  id: number
  created_on: string
  modified_on: string
  domain_names: string[]
  forward_host: string
  forward_port: number
  access_list_id: number
  certificate_id: number | string
  ssl_forced: boolean
  caching_enabled: boolean
  block_exploits: boolean
  advanced_config: string
  enabled: boolean
  http2_support: boolean
  hsts_enabled: boolean
  hsts_subdomains: boolean
  preserve_host: boolean
  allow_websocket_upgrade: boolean
  status: string
}
