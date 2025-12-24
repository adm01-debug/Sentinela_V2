export interface Translator<TExternal, TInternal> {
  toInternal(external: TExternal): TInternal;
  toExternal(internal: TInternal): TExternal;
}

export interface AntiCorruptionFacade<T> {
  execute<R>(operation: (service: T) => Promise<R>): Promise<R>;
}

export interface ExternalServiceAdapter<T> {
  getService(): T;
  isAvailable(): Promise<boolean>;
  healthCheck(): Promise<HealthStatus>;
}

export interface HealthStatus {
  healthy: boolean;
  latencyMs: number;
  lastCheck: Date;
  details?: Record<string, unknown>;
}