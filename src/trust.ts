export interface LifecycleRequestHeaders {
  host?: string
  origin?: string
  secFetchSite?: string
}

function isLoopbackHostname(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  const parts = hostname.split('.')
  return (
    parts.length === 4 &&
    parts[0] === '127' &&
    parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
  )
}

function parseAuthority(authority: string): URL | undefined {
  try {
    return new URL(`http://${authority}`)
  } catch {
    return undefined
  }
}

/**
 * Same-origin + loopback fence for mutation routes. Mirrors the DSH
 * `/api` Host fence: a missing Host is refused, cross-site Fetch is refused,
 * and an Origin must match the Host authority.
 */
export function isTrustedLifecycleRequest(headers: LifecycleRequestHeaders): boolean {
  if (headers.host === undefined) return false
  const hostUrl = parseAuthority(headers.host)
  if (hostUrl === undefined) return false
  if (!isLoopbackHostname(hostUrl.hostname)) return false
  if (headers.secFetchSite === 'cross-site') return false
  if (headers.origin === undefined) return true
  try {
    return new URL(headers.origin).host === hostUrl.host
  } catch {
    return false
  }
}
