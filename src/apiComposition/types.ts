export interface CompositionConfig {
  name: string;
  sources: DataSource[];
  transforms: Transform[];
  caching?: CacheConfig;
}

export interface DataSource {
  name: string;
  type: 'rest' | 'graphql' | 'grpc';
  endpoint: string;
  headers?: Record<string, string>;
}

export interface Transform {
  type: 'merge' | 'filter' | 'map' | 'reduce';
  config: Record<string, unknown>;
}

export interface CacheConfig { enabled: boolean; ttlMs: number; }

export interface CompositionResult<T = unknown> {
  data: T;
  sources: string[];
  timing: Record<string, number>;
  cached: boolean;
}