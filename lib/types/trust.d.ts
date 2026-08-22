export interface LifecycleRequestHeaders {
    host?: string;
    origin?: string;
    secFetchSite?: string;
}
/**
 * Same-origin + loopback fence for mutation routes. Mirrors the DSH
 * `/api` Host fence: a missing Host is refused, cross-site Fetch is refused,
 * and an Origin must match the Host authority.
 */
export declare function isTrustedLifecycleRequest(headers: LifecycleRequestHeaders): boolean;
