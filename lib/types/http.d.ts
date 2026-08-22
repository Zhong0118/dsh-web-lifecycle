import type { IncomingMessage, ServerResponse } from 'node:http';
export declare const STATUS_PATH = "/dsh-web-lifecycle/status";
export declare const RESTART_PATH = "/dsh-web-lifecycle/restart";
export declare const SHUTDOWN_PATH = "/dsh-web-lifecycle/shutdown";
export declare function readHeader(req: IncomingMessage, name: string): string | undefined;
export declare function refuseUnlessTrusted(req: IncomingMessage, res: ServerResponse): boolean;
export declare function sendJson(res: ServerResponse, status: number, body: unknown): void;
export declare function methodNotAllowed(res: ServerResponse, allow: string): void;
