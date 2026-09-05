export declare function versionFromManifest(manifest: {
    name?: string;
    version?: string;
}): string | undefined;
/**
 * Locate `@deepseek-ai/dsh/package.json` from the running process.
 * `process.argv[1]` is often the `bin/dsh` symlink; we realpath it first so
 * the walk lands in the CLI package instead of Node's `bin/` directory.
 */
export declare function findDshManifest(files: readonly string[]): string | undefined;
/**
 * DSH CLI version (`dsh --version`) — never this plugin's version.
 */
export declare function readDshVersion(files?: readonly string[]): string;
