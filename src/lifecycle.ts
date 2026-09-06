export interface ShutdownRequest {
  accepted: true
}

export interface ShutdownHooks {
  appExit: (code: number) => void
  schedule: (fn: () => void) => void
}

/**
 * Accept shutdown first so the HTTP response can leave the process, then
 * request a graceful tree dispose through `ctx.appExit(0)`.
 */
export function requestShutdown(hooks: ShutdownHooks): ShutdownRequest {
  hooks.schedule(() => {
    hooks.appExit(0)
  })
  return { accepted: true }
}

export interface FlushableResponse {
  writableFinished?: boolean
  once(event: 'finish', listener: () => void): void
}

/**
 * Wait until Node has flushed the HTTP response, then request exit.
 * `res.end()` plus `setImmediate` is not enough under gzip: compression
 * finishes on a later tick, and `appExit` would close the socket first.
 */
export function scheduleExitAfterResponse(res: FlushableResponse, hooks: ShutdownHooks): void {
  const exit = () => {
    requestShutdown(hooks)
  }
  if (res.writableFinished === true) {
    exit()
    return
  }
  res.once('finish', exit)
}
