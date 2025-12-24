export function lazyComponent<T>(importFn: () => Promise<{ default: T }>): () => Promise<T> { let cached: T | null = null; return async () => { if (cached) return cached; const module = await importFn(); cached = module.default; return cached; }; }
export function preloadComponent(importFn: () => Promise<any>): void { importFn().catch(() => {}); }
export class LazyComponentRegistry {
  private components = new Map<string, () => Promise<any>>();
  register(name: string, importFn: () => Promise<any>): void { this.components.set(name, lazyComponent(importFn)); }
  async load(name: string): Promise<any> { const loader = this.components.get(name); return loader ? loader() : null; }
}
export const lazyComponentRegistry = new LazyComponentRegistry();
