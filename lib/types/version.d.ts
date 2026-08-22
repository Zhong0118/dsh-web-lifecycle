export declare function versionFromManifest(manifest: {
    name?: string;
    version?: string;
}): string | undefined;
/**
 * DSH product version of the running process — never this plugin's version.
 * Recorded once from the installed DSH packages / launcher package.json.
 */
export declare function readDshVersion(): string;
