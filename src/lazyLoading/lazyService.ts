export class LazyService {
  private loadedModules = new Map<string, any>();
  async load<T>(name: string, importFn: () => Promise<T>): Promise<T> { if (this.loadedModules.has(name)) return this.loadedModules.get(name); const module = await importFn(); this.loadedModules.set(name, module); return module; }
  isLoaded(name: string): boolean { return this.loadedModules.has(name); }
  unload(name: string): void { this.loadedModules.delete(name); }
  getLoadedModules(): string[] { return Array.from(this.loadedModules.keys()); }
}
export const lazyService = new LazyService();
