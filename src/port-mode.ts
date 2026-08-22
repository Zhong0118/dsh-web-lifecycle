export type PortMode = 'default' | 'fixed' | 'auto'

/**
 * Read the first `--port` / `--port=` value from an argv snapshot.
 * Inner app flags only — the caller should pass `process.argv` or
 * `ctx.cmdlineArgs.get()`.
 */
export function parsePortFlag(args: readonly string[]): number | undefined {
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i]
    if (token === '--port') {
      const next = args[i + 1]
      if (next === undefined || next.startsWith('-')) return undefined
      if (!/^\d+$/.test(next)) return undefined
      return Number(next)
    }
    if (token.startsWith('--port=')) {
      const value = token.slice('--port='.length)
      if (!/^\d+$/.test(value)) return undefined
      return Number(value)
    }
  }
  return undefined
}

export function resolvePortMode(args: readonly string[]): PortMode {
  const port = parsePortFlag(args)
  if (port === undefined) return 'default'
  if (port === 0) return 'auto'
  return 'fixed'
}
