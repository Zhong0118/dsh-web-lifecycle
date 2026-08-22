import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parsePortFlag, resolvePortMode } from '../src/port-mode.ts'
import { collectServiceStatus } from '../src/status.ts'

test('no --port is default mode, not an assumed 3080', () => {
  assert.equal(parsePortFlag(['web']), undefined)
  assert.equal(resolvePortMode(['web']), 'default')
  assert.equal(resolvePortMode(['--profile', 'web']), 'default')
})

test('--port 8080 is fixed mode', () => {
  assert.equal(parsePortFlag(['web', '--port', '8080']), 8080)
  assert.equal(resolvePortMode(['web', '--port', '8080']), 'fixed')
  assert.equal(parsePortFlag(['--port=9090']), 9090)
  assert.equal(resolvePortMode(['--port=9090']), 'fixed')
})

test('--port 0 is auto mode', () => {
  assert.equal(parsePortFlag(['web', '--port', '0']), 0)
  assert.equal(resolvePortMode(['web', '--port', '0']), 'auto')
  assert.equal(resolvePortMode(['--port=0']), 'auto')
})

test('status uses the runtime listen port, not a hardcoded 3080', () => {
  const status = collectServiceStatus({
    pid: 12345,
    uptimeSeconds: 7263,
    port: 49321,
    host: '127.0.0.1',
    nodeVersion: 'v24.19.0',
    version: '0.1.0-rc.8',
    cmdlineArgs: ['web', '--port', '0'],
  })
  assert.equal(status.status, 'running')
  assert.equal(status.pid, 12345)
  assert.equal(status.port, 49321)
  assert.equal(status.address, '127.0.0.1:49321')
  assert.equal(status.portMode, 'auto')
  assert.equal(status.uptime, 7263)
  assert.equal(status.version, '0.1.0-rc.8')
  assert.equal(status.node, 'v24.19.0')
})

test('default launch still reports the actual bound port', () => {
  const status = collectServiceStatus({
    pid: 8,
    uptimeSeconds: 1,
    port: 3080,
    host: '127.0.0.1',
    nodeVersion: 'v22.0.0',
    version: '0.1.0-rc.8',
    cmdlineArgs: [],
  })
  assert.equal(status.port, 3080)
  assert.equal(status.portMode, 'default')
})
