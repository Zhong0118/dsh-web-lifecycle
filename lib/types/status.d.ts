import { type PortMode } from './port-mode.ts';
export interface ServiceStatus {
    status: 'running';
    pid: number;
    port: number;
    host: string;
    address: string;
    uptime: number;
    version: string;
    node: string;
    portMode: PortMode;
}
export interface StatusFacts {
    pid: number;
    uptimeSeconds: number;
    port: number;
    host: string;
    nodeVersion: string;
    version: string;
    cmdlineArgs: readonly string[];
}
export declare function collectServiceStatus(facts: StatusFacts): ServiceStatus;
