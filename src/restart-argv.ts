/**
 * Rewrite process.argv so a restart keeps the URL the browser is already on.
 *
 * Missing `--port` is filled with the live listen port. `--port 0` / `--port=0`
 * is replaced with that live port so the OS does not pick a new random one.
 */
export function rewriteArgvForRestart(argv: readonly string[], livePort: number): string[] {
  const next: string[] = []
  let sawPort = false
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--port') {
      const value = argv[i + 1]
      if (value !== undefined && !value.startsWith('-')) {
        next.push('--port', String(livePort))
        i += 1
        sawPort = true
        continue
      }
      next.push('--port', String(livePort))
      sawPort = true
      continue
    }
    if (token.startsWith('--port=')) {
      next.push('--port', String(livePort))
      sawPort = true
      continue
    }
    next.push(token)
  }
  if (!sawPort) next.push('--port', String(livePort))
  return next
}
