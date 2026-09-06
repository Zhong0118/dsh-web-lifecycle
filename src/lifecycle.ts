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
  destroyed?: boolean
  once(event: 'close' | 'finish', listener: () => void): void
}

/**
 * Wait until the HTTP socket is gone, then request exit.
 * gzip / keep-alive can still be flushing after `res.end()` and `finish`;
 * exiting earlier drops the browser fetch.
 */
export function scheduleExitAfterResponse(res: FlushableResponse, hooks: ShutdownHooks): void {
  const exit = () => {
    requestShutdown(hooks)
  }
  if (res.destroyed === true) {
    exit()
    return
  }
  res.once('close', exit)
}
