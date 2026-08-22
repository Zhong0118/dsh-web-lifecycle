export function formatUptime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

export function bootAtFromSample(uptimeSeconds: number, sampledAtMs: number): number {
  return sampledAtMs - uptimeSeconds * 1000
}

export function liveUptimeSeconds(bootAtMs: number, nowMs: number): number {
  return Math.max(0, (nowMs - bootAtMs) / 1000)
}
