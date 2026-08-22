import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bootAtFromSample, formatUptime, liveUptimeSeconds } from '../src/client/format.ts'

test('uptime formatting stays human-readable and includes seconds', () => {
  assert.equal(formatUptime(12), '12s')
  assert.equal(formatUptime(75), '1m 15s')
  assert.equal(formatUptime(7263), '2h 1m 3s')
})

test('uptime keeps ticking from the sampled boot instant', () => {
  const sampledAt = 1_000_000
  const bootAt = bootAtFromSample(10, sampledAt)
  assert.equal(formatUptime(liveUptimeSeconds(bootAt, sampledAt)), '10s')
  assert.equal(formatUptime(liveUptimeSeconds(bootAt, sampledAt + 5000)), '15s')
})
