import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { findDshManifest, readDshVersion, versionFromManifest } from '../src/version.ts'

test('never reports this plugin version as the DSH version', () => {
  assert.equal(
    versionFromManifest({ name: 'dsh-web-lifecycle', version: '0.1.0' }),
    undefined,
  )
})

test('records the installed DSH CLI package version', () => {
  assert.equal(versionFromManifest({ name: '@deepseek-ai/dsh', version: '0.1.0-rc.8' }), '0.1.0-rc.8')
  assert.equal(
    versionFromManifest({ name: '@deepseek-ai/dsh-web-app', version: '0.1.0-rc.8' }),
    undefined,
  )
})

test('follows the bin/dsh symlink into the CLI package, like a real install', () => {
  const root = mkdtempSync(join(tmpdir(), 'dsh-web-lifecycle-version-'))
  const cliDir = join(root, 'lib', 'node_modules', '@deepseek-ai', 'dsh')
  mkdirSync(join(cliDir, 'lib'), { recursive: true })
  mkdirSync(join(root, 'bin'), { recursive: true })
  writeFileSync(
    join(cliDir, 'package.json'),
    JSON.stringify({ name: '@deepseek-ai/dsh', version: '0.1.0-rc.8' }),
  )
  writeFileSync(join(cliDir, 'lib', 'bin.js'), 'export {}\n')
  const symlink = join(root, 'bin', 'dsh')
  symlinkSync(join(cliDir, 'lib', 'bin.js'), symlink)

  assert.equal(dirname(symlink).endsWith('bin'), true)
  assert.equal(findDshManifest([symlink]), realpathSync(join(cliDir, 'package.json')))
  assert.equal(readDshVersion([symlink]), '0.1.0-rc.8')
})
