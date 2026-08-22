export const RESTART_HELPER_ENV = 'DSH_WEB_LIFECYCLE_RESTART'

export interface RestartPayload {
  execPath: string
  argv: string[]
  cwd: string
  env: NodeJS.ProcessEnv
  port: number
  host: string
  parentPid: number
}

export function encodeRestartPayload(payload: RestartPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64')
}

export function decodeRestartPayload(encoded: string): RestartPayload {
  const parsed = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as RestartPayload
  if (
    typeof parsed.execPath !== 'string' ||
    !Array.isArray(parsed.argv) ||
    typeof parsed.cwd !== 'string' ||
    typeof parsed.port !== 'number' ||
    typeof parsed.host !== 'string' ||
    typeof parsed.parentPid !== 'number'
  ) {
    throw new Error('dsh-web-lifecycle: invalid restart payload')
  }
  return parsed
}
