import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { decodeRestartPayload, RESTART_HELPER_ENV } from './restart-payload.ts'
import { runRestartHelper } from './restart-helper-core.ts'

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function isPortFree(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.listen(port, host, () => {
      server.close(() => resolve(true))
    })
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function main(): Promise<void> {
  const encoded = process.env[RESTART_HELPER_ENV]
  if (encoded === undefined || encoded === '') {
    throw new Error('dsh-web-lifecycle helper: missing restart payload')
  }
  const payload = decodeRestartPayload(encoded)
  const env = { ...payload.env }
  delete env[RESTART_HELPER_ENV]

  const result = await runRestartHelper(payload, {
    isPidAlive,
    isPortFree,
    spawnDetached: (command, args, options) => {
      const child = spawn(command, args, {
        cwd: options.cwd,
        env,
        detached: true,
        stdio: ['ignore', 'inherit', 'inherit'],
      })
      child.unref()
      if (child.pid === undefined) throw new Error('dsh-web-lifecycle helper: failed to spawn DSH')
      return child.pid
    },
    sleep,
    now: () => Date.now(),
  })

  if (!result.ok) {
    console.error(`[dsh-web-lifecycle] restart failed: ${result.error}`)
    process.exitCode = 1
  }
}

await main()
