import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DSH_CLI = '@deepseek-ai/dsh'

export function versionFromManifest(
  manifest: { name?: string; version?: string },
): string | undefined {
  if (typeof manifest.version !== 'string' || manifest.version.length === 0) return undefined
  if (manifest.name !== DSH_CLI) return undefined
  return manifest.version
}

function readManifest(path: string): { name?: string; version?: string } | undefined {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as { name?: string; version?: string }
  } catch {
    return undefined
  }
}

function realpathOrSelf(path: string): string {
  try {
    return realpathSync(path)
  } catch {
    return path
  }
}

function resolveDshManifestFrom(from: string): string | undefined {
  try {
    return createRequire(from).resolve(`${DSH_CLI}/package.json`)
  } catch {
    return undefined
  }
}

function walkForDshManifest(startFile: string): string | undefined {
  let dir = dirname(startFile)
  for (let i = 0; i < 16; i += 1) {
    const pkg = join(dir, 'package.json')
    if (existsSync(pkg)) {
      const manifest = readManifest(pkg)
      if (manifest?.name === DSH_CLI) return pkg
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return undefined
}

/**
 * Locate `@deepseek-ai/dsh/package.json` from the running process.
 * `process.argv[1]` is often the `bin/dsh` symlink; we realpath it first so
 * the walk lands in the CLI package instead of Node's `bin/` directory.
 */
export function findDshManifest(files: readonly string[]): string | undefined {
  const seen = new Set<string>()
  for (const file of files) {
    if (file.length === 0) continue
    const resolved = realpathOrSelf(file)
    for (const candidate of [file, resolved]) {
      if (seen.has(candidate)) continue
      seen.add(candidate)
      const fromRequire = resolveDshManifestFrom(candidate)
      if (fromRequire !== undefined) return fromRequire
      const walked = walkForDshManifest(candidate)
      if (walked !== undefined) return walked
    }
  }
  return undefined
}

/**
 * DSH CLI version (`dsh --version`) — never this plugin's version.
 */
export function readDshVersion(
  files: readonly string[] = [process.argv[1] ?? '', fileURLToPath(import.meta.url)],
): string {
  const manifestPath = findDshManifest(files)
  if (manifestPath === undefined) return 'unknown'
  return versionFromManifest(readManifest(manifestPath) ?? {}) ?? 'unknown'
}
