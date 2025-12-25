/**
 * @fileoverview Configuration Management
 * @module @sentinela/core/config
 */
export class Config<T extends Record<string, unknown>> {
  private values: T;
  constructor(defaults: T) { this.values = { ...defaults }; }
  get<K extends keyof T>(key: K): T[K] { return this.values[key]; }
  set<K extends keyof T>(key: K, value: T[K]): void { this.values[key] = value; }
  merge(overrides: Partial<T>): void { this.values = { ...this.values, ...overrides }; }
  all(): T { return { ...this.values }; }
  static fromEnv<T extends Record<string, string>>(mapping: Record<keyof T, string>): Partial<T> {
    const result: Partial<T> = {};
    for (const [key, envVar] of Object.entries(mapping)) {
      if (process.env[envVar]) (result as any)[key] = process.env[envVar];
    }
    return result;
  }
}
