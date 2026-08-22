export declare const RESTART_HELPER_ENV = "DSH_WEB_LIFECYCLE_RESTART";
export interface RestartPayload {
    execPath: string;
    argv: string[];
    cwd: string;
    env: NodeJS.ProcessEnv;
    port: number;
    host: string;
    parentPid: number;
}
export declare function encodeRestartPayload(payload: RestartPayload): string;
export declare function decodeRestartPayload(encoded: string): RestartPayload;
