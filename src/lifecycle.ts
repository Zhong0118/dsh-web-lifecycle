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
