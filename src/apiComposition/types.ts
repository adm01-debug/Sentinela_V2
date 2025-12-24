export interface CompositionConfig {
  services: ServiceConfig[];
  timeout: number;
  cacheConfig?: CacheConfig;
}

export interface ServiceConfig {
  name: string;
  endpoint: string;
  required: boolean;
  transform?: (data: unknown) => unknown;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  key: string;
}

export interface CompositionResult<T = unknown> {
  data: T;
  sources: SourceResult[];
  duration: number;
}

export interface SourceResult {
  service: string;
  success: boolean;
  duration: number;
  error?: string;
}