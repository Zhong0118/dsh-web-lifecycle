/**
 * Rewrite process.argv so a restart keeps the URL the browser is already on.
 *
 * Missing `--port` is filled with the live listen port. `--port 0` / `--port=0`
 * is replaced with that live port so the OS does not pick a new random one.
 */
export declare function rewriteArgvForRestart(argv: readonly string[], livePort: number): string[];
