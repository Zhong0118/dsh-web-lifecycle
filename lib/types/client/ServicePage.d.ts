import { type ReactElement } from 'react';
import type { CopyKey } from './locales.ts';
export interface ServiceStatusView {
    status: 'running';
    pid: number;
    port: number;
    host: string;
    address: string;
    uptime: number;
    version: string;
    node: string;
    portMode: 'default' | 'fixed' | 'auto';
}
export interface ServicePageProps {
    t: (key: CopyKey) => string;
}
export declare function ServicePage(props: ServicePageProps): ReactElement;
