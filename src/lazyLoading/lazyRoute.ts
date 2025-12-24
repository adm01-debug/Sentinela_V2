export interface LazyRoute { path: string; component: () => Promise<any>; preload?: boolean; }
export class LazyRouteManager {
  private routes = new Map<string, LazyRoute>();
  register(route: LazyRoute): void { this.routes.set(route.path, route); if (route.preload) this.preload(route.path); }
  async load(path: string): Promise<any> { const route = this.routes.get(path); return route ? route.component() : null; }
  preload(path: string): void { const route = this.routes.get(path); route?.component().catch(() => {}); }
  preloadAll(): void { this.routes.forEach((_, path) => this.preload(path)); }
}
export const lazyRouteManager = new LazyRouteManager();
