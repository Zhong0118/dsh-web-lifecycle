import { resolvePortMode, type PortMode } from './port-mode.ts'

export interface ServiceStatus {
  status: 'running'
  pid: number
  port: number
  host: string
  address: string
  uptime: number
  version: string
  node: string
  portMode: PortMode
}

export interface StatusFacts {
  pid: number
  uptimeSeconds: number
  port: number
  host: string
  nodeVersion: string
  version: string
  cmdlineArgs: readonly string[]
}

export function collectServiceStatus(facts: StatusFacts): ServiceStatus {
  return {
    status: 'running',
    pid: facts.pid,
    port: facts.port,
    host: facts.host,
    address: `${facts.host}:${facts.port}`,
    uptime: facts.uptimeSeconds,
    version: facts.version,
    node: facts.nodeVersion,
    portMode: resolvePortMode(facts.cmdlineArgs),
  }
}
