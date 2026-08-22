import { rewriteArgvForRestart } from './restart-argv.ts'
import type { RestartPayload } from './restart-payload.ts'

export interface RestartHelperIo {
  isPidAlive: (pid: number) => boolean
  isPortFree: (host: string, port: number) => Promise<boolean>
  spawnDetached: (
    command: string,
    args: string[],
    options: { cwd: string; env: NodeJS.ProcessEnv },
  ) => number
  kill?: (pid: number) => void
  sleep: (ms: number) => Promise<void>
  now: () => number
}

export type RestartHelperResult =
  | { ok: true; childPid: number }
  | { ok: false; error: string }

const PARENT_WAIT_MS = 15_000
const PORT_WAIT_MS = 10_000
const POLL_MS = 100

export async function runRestartHelper(
  payload: RestartPayload,
  io: RestartHelperIo,
): Promise<RestartHelperResult> {
  const parentDeadline = io.now() + PARENT_WAIT_MS
  while (io.isPidAlive(payload.parentPid)) {
    if (io.now() >= parentDeadline) {
      return { ok: false, error: `timed out waiting for DSH pid ${payload.parentPid} to exit` }
    }
    await io.sleep(POLL_MS)
  }

  const portDeadline = io.now() + PORT_WAIT_MS
  while (!(await io.isPortFree(payload.host, payload.port))) {
    if (io.now() >= portDeadline) {
      return {
        ok: false,
        error: `EADDRINUSE: ${payload.host}:${payload.port} is still in use after DSH exited; not killing the occupant`,
      }
    }
    await io.sleep(POLL_MS)
  }

  const argv = rewriteArgvForRestart(payload.argv, payload.port)
  const [command, ...args] = argv[0] === payload.execPath ? argv : [payload.execPath, ...argv]
  const childPid = io.spawnDetached(command, args, {
    cwd: payload.cwd,
    env: payload.env,
  })
  return { ok: true, childPid }
}
