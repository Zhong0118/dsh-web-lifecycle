import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rewriteArgvForRestart } from '../src/restart-argv.ts'
import { runRestartHelper } from '../src/restart-helper-core.ts'

test('dsh web restart keeps the default listen port by writing it explicitly', () => {
  const next = rewriteArgvForRestart(
    ['/usr/bin/node', '/opt/dsh/lib/bin.js', 'web'],
    3080,
  )
  assert.deepEqual(next, ['/usr/bin/node', '/opt/dsh/lib/bin.js', 'web', '--port', '3080'])
})

test('dsh web --port 8080 restart keeps 8080', () => {
  const next = rewriteArgvForRestart(
    ['/usr/bin/node', '/opt/dsh/lib/bin.js', 'web', '--port', '8080'],
    8080,
  )
  assert.deepEqual(next, ['/usr/bin/node', '/opt/dsh/lib/bin.js', 'web', '--port', '8080'])
})

test('--port 0 restart replaces the random flag with the actual assigned port', () => {
  const next = rewriteArgvForRestart(
    ['/usr/bin/node', '/opt/dsh/lib/bin.js', 'web', '--port', '0'],
    49321,
  )
  assert.deepEqual(next, ['/usr/bin/node', '/opt/dsh/lib/bin.js', 'web', '--port', '49321'])
})

test('--port=0 equals form is rewritten to the actual port', () => {
  const next = rewriteArgvForRestart(
    ['node', 'bin.js', '--profile', 'web', '--port=0'],
    51782,
  )
  assert.deepEqual(next, ['node', 'bin.js', '--profile', 'web', '--port', '51782'])
})

test('helper waits for the recorded pid, then starts the rewritten command', async () => {
  const spawned: Array<{ command: string; args: string[]; cwd: string }> = []
  let alive = true
  const result = await runRestartHelper(
    {
      execPath: '/usr/bin/node',
      argv: ['/usr/bin/node', '/opt/dsh/lib/bin.js', 'web', '--port', '0'],
      cwd: '/workspace',
      env: { PATH: '/usr/bin' },
      port: 49321,
      host: '127.0.0.1',
      parentPid: 4242,
    },
    {
      isPidAlive: (pid) => {
        assert.equal(pid, 4242)
        return alive
      },
      isPortFree: async () => true,
      spawnDetached: (command, args, options) => {
        spawned.push({ command, args, cwd: options.cwd })
        return 99
      },
      sleep: async () => {
        alive = false
      },
      now: () => 0,
    },
  )
  assert.equal(result.ok, true)
  assert.deepEqual(spawned, [
    {
      command: '/usr/bin/node',
      args: ['/opt/dsh/lib/bin.js', 'web', '--port', '49321'],
      cwd: '/workspace',
    },
  ])
})

test('helper fails without killing anyone when the port is stolen', async () => {
  const killed: number[] = []
  const spawned: unknown[] = []
  const result = await runRestartHelper(
    {
      execPath: '/usr/bin/node',
      argv: ['/usr/bin/node', '/opt/dsh/lib/bin.js', 'web', '--port', '8080'],
      cwd: '/workspace',
      env: {},
      port: 8080,
      host: '127.0.0.1',
      parentPid: 7,
    },
    {
      isPidAlive: () => false,
      isPortFree: async () => false,
      spawnDetached: () => {
        spawned.push('spawned')
        return 1
      },
      kill: (pid) => {
        killed.push(pid)
      },
      sleep: async () => {},
      now: (() => {
        let t = 0
        return () => {
          t += 20_000
          return t
        }
      })(),
    },
  )
  assert.equal(result.ok, false)
  assert.match(result.error ?? '', /EADDRINUSE|port/i)
  assert.deepEqual(killed, [])
  assert.deepEqual(spawned, [])
})
