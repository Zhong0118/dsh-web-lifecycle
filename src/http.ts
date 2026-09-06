import type { IncomingMessage, ServerResponse } from 'node:http'
import { isTrustedLifecycleRequest } from './trust.ts'

export const STATUS_PATH = '/dsh-web-lifecycle/status'
export const RESTART_PATH = '/dsh-web-lifecycle/restart'
export const SHUTDOWN_PATH = '/dsh-web-lifecycle/shutdown'

export function readHeader(req: IncomingMessage, name: string): string | undefined {
  const value = req.headers[name]
  return typeof value === 'string' ? value : undefined
}

export function refuseUnlessTrusted(req: IncomingMessage, res: ServerResponse): boolean {
  const trusted = isTrustedLifecycleRequest({
    host: readHeader(req, 'host'),
    origin: readHeader(req, 'origin'),
    secFetchSite: readHeader(req, 'sec-fetch-site'),
  })
  if (trusted) return true
  res.writeHead(403, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ error: 'forbidden' }))
  return false
}

export function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  extraHeaders: Record<string, string> = {},
): void {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...extraHeaders,
  })
  res.end(payload)
}

export function methodNotAllowed(res: ServerResponse, allow: string): void {
  res.writeHead(405, {
    allow,
    'content-type': 'application/json; charset=utf-8',
  })
  res.end(JSON.stringify({ error: 'method not allowed' }))
}
