export type PortMode = 'default' | 'fixed' | 'auto';
/**
 * Read the first `--port` / `--port=` value from an argv snapshot.
 * Inner app flags only — the caller should pass `process.argv` or
 * `ctx.cmdlineArgs.get()`.
 */
export declare function parsePortFlag(args: readonly string[]): number | undefined;
export declare function resolvePortMode(args: readonly string[]): PortMode;
