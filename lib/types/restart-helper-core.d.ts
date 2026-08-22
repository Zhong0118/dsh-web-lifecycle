import type { RestartPayload } from './restart-payload.ts';
export interface RestartHelperIo {
    isPidAlive: (pid: number) => boolean;
    isPortFree: (host: string, port: number) => Promise<boolean>;
    spawnDetached: (command: string, args: string[], options: {
        cwd: string;
        env: NodeJS.ProcessEnv;
    }) => number;
    kill?: (pid: number) => void;
    sleep: (ms: number) => Promise<void>;
    now: () => number;
}
export type RestartHelperResult = {
    ok: true;
    childPid: number;
} | {
    ok: false;
    error: string;
};
export declare function runRestartHelper(payload: RestartPayload, io: RestartHelperIo): Promise<RestartHelperResult>;
