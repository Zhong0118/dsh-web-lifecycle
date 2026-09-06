import assert from 'node:assert/strict'
import { test } from 'node:test'
import { requestShutdown, scheduleExitAfterResponse } from '../src/lifecycle.ts'
import { isTrustedLifecycleRequest } from '../src/trust.ts'

test('shutdown accepts first, then appExit on the next tick — never exit before the response', () => {
  const events: string[] = []
  let scheduled: (() => void) | undefined
  const accepted = requestShutdown({
    appExit: (code) => {
      events.push(`exit:${code}`)
    },
    schedule: (fn) => {
      events.push('scheduled')
      scheduled = fn
    },
  })
  assert.equal(accepted.accepted, true)
  assert.deepEqual(events, ['scheduled'])
  scheduled?.()
  assert.deepEqual(events, ['scheduled', 'exit:0'])
})

test('does not schedule appExit until the HTTP socket has closed', async () => {
  const events: string[] = []
  scheduleExitAfterResponse(
    {
      writableFinished: false,
      destroyed: false,
      once(event, listener) {
        events.push(`once:${event}`)
        if (event === 'close') {
          queueMicrotask(() => {
            events.push('close')
            listener()
          })
        }
      },
    },
    {
      appExit: (code) => {
        events.push(`exit:${code}`)
      },
      schedule: (fn) => {
        events.push('scheduled')
        fn()
      },
    },
  )
  assert.deepEqual(events, ['once:close'])
  await Promise.resolve()
  await Promise.resolve()
  assert.deepEqual(events, ['once:close', 'close', 'scheduled', 'exit:0'])
})

test('cross-site Origin is rejected so a foreign page cannot shut DSH down', () => {
  assert.equal(
    isTrustedLifecycleRequest({
      host: '127.0.0.1:3080',
      origin: 'https://evil.example',
      secFetchSite: 'cross-site',
    }),
    false,
  )
  assert.equal(
    isTrustedLifecycleRequest({
      host: '127.0.0.1:3080',
      origin: 'http://127.0.0.1:3080',
    }),
    true,
  )
  assert.equal(
    isTrustedLifecycleRequest({
      host: '127.0.0.1:49321',
      origin: 'http://127.0.0.1:49321',
    }),
    true,
  )
  assert.equal(isTrustedLifecycleRequest({ origin: 'http://127.0.0.1:3080' }), false)
})
