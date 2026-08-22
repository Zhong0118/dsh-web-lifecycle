import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { requestShutdown } from './lifecycle.ts'
import { sendJson, methodNotAllowed, refuseUnlessTrusted, STATUS_PATH, RESTART_PATH, SHUTDOWN_PATH } from './http.ts'
import { spawnRestartHelper } from './spawn-helper.ts'
import { collectServiceStatus } from './status.ts'
import { readDshVersion } from './version.ts'

export const name = 'web-lifecycle'
export const inject = ['webServer']

function cmdlineOf(ctx: Context): readonly string[] {
  const args = ctx.get('cmdlineArgs') as { get(): readonly string[] } | undefined
  return args?.get() ?? []
}

function statusFrom(ctx: Context) {
  return collectServiceStatus({
    pid: process.pid,
    uptimeSeconds: process.uptime(),
    port: ctx.webServer.port,
    host: ctx.webServer.host,
    nodeVersion: process.version,
    version: readDshVersion(),
    cmdlineArgs: cmdlineOf(ctx),
  })
}

function handleStatus(ctx: Context, req: IncomingMessage, res: ServerResponse): void {
  if (!refuseUnlessTrusted(req, res)) return
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    methodNotAllowed(res, 'GET, HEAD')
    return
  }
  sendJson(res, 200, statusFrom(ctx))
}

function handleShutdown(ctx: Context, req: IncomingMessage, res: ServerResponse): void {
  if (!refuseUnlessTrusted(req, res)) return
  if (req.method !== 'POST') {
    methodNotAllowed(res, 'POST')
    return
  }
  const appExit = ctx.get('appExit') as ((code: number) => void) | undefined
  if (appExit === undefined) {
    sendJson(res, 500, { error: 'appExit is unavailable' })
    return
  }
  const accepted = requestShutdown({
    appExit,
    schedule: (fn) => {
      setImmediate(fn)
    },
  })
  sendJson(res, 202, accepted)
}

function handleRestart(ctx: Context, req: IncomingMessage, res: ServerResponse): void {
  if (!refuseUnlessTrusted(req, res)) return
  if (req.method !== 'POST') {
    methodNotAllowed(res, 'POST')
    return
  }
  const appExit = ctx.get('appExit') as ((code: number) => void) | undefined
  if (appExit === undefined) {
    sendJson(res, 500, { error: 'appExit is unavailable' })
    return
  }
  try {
    spawnRestartHelper({
      execPath: process.execPath,
      argv: process.argv.slice(),
      cwd: process.cwd(),
      env: { ...process.env },
      port: ctx.webServer.port,
      host: ctx.webServer.host,
      parentPid: process.pid,
    })
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) })
    return
  }
  requestShutdown({
    appExit,
    schedule: (fn) => {
      setImmediate(fn)
    },
  })
  sendJson(res, 202, { accepted: true })
}

export function apply(ctx: Context): void {
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: STATUS_PATH,
        handler: (req, res) => handleStatus(ctx, req, res),
      }),
    'web-lifecycle: GET status',
  )
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: RESTART_PATH,
        handler: (req, res) => handleRestart(ctx, req, res),
      }),
    'web-lifecycle: POST restart',
  )
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: SHUTDOWN_PATH,
        handler: (req, res) => handleShutdown(ctx, req, res),
      }),
    'web-lifecycle: POST shutdown',
  )
}
