export interface ShutdownRequest {
    accepted: true;
}
export interface ShutdownHooks {
    appExit: (code: number) => void;
    schedule: (fn: () => void) => void;
}
/**
 * Accept shutdown first so the HTTP response can leave the process, then
 * request a graceful tree dispose through `ctx.appExit(0)`.
 */
export declare function requestShutdown(hooks: ShutdownHooks): ShutdownRequest;
