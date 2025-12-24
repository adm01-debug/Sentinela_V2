export interface CDNConfig { provider: 'cloudflare' | 'fastly' | 'akamai' | 'custom'; origins: Origin[]; cacheRules: CacheRule[]; }
export interface Origin { url: string; weight: number; backup?: boolean; }
export interface CacheRule { path: string; ttl: number; staleWhileRevalidate?: number; staleIfError?: number; }
export interface CDNStats { hits: number; misses: number; bandwidth: number; requests: number; }