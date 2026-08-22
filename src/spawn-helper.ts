import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { encodeRestartPayload, RESTART_HELPER_ENV, type RestartPayload } from './restart-payload.ts'

export function helperScriptPath(): string {
  return fileURLToPath(new URL('./restart-helper.js', import.meta.url))
}

export function spawnRestartHelper(payload: RestartPayload): number {
  const child = spawn(process.execPath, [helperScriptPath()], {
    detached: true,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: {
      ...process.env,
      [RESTART_HELPER_ENV]: encodeRestartPayload(payload),
    },
  })
  child.unref()
  if (child.pid === undefined) throw new Error('dsh-web-lifecycle: failed to spawn restart helper')
  return child.pid
}
