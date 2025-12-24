// Strangler Fig Pattern - Facade
export interface RouteConfig {
  path: string;
  legacy: string;
  modern?: string;
  migrationPercent: number;
  enabled: boolean;
}

export class StranglerFacade {
  private routes: Map<string, RouteConfig> = new Map();
  private metrics: Map<string, { legacy: number; modern: number }> = new Map();

  addRoute(config: RouteConfig): void {
    this.routes.set(config.path, config);
    this.metrics.set(config.path, { legacy: 0, modern: 0 });
  }

  async route(path: string, request: Request): Promise<Response> {
    const config = this.findRoute(path);
    if (!config) return new Response("Not Found", { status: 404 });

    const useModern = config.modern && config.enabled && 
      Math.random() * 100 < config.migrationPercent;

    const target = useModern ? config.modern! : config.legacy;
    const metrics = this.metrics.get(config.path)!;
    
    if (useModern) metrics.modern++;
    else metrics.legacy++;

    return fetch(target + path, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
  }

  private findRoute(path: string): RouteConfig | undefined {
    for (const [pattern, config] of this.routes) {
      if (path.startsWith(pattern) || pattern === "*") return config;
    }
    return undefined;
  }

  setMigrationPercent(path: string, percent: number): void {
    const config = this.routes.get(path);
    if (config) config.migrationPercent = Math.max(0, Math.min(100, percent));
  }

  enableRoute(path: string, enabled: boolean): void {
    const config = this.routes.get(path);
    if (config) config.enabled = enabled;
  }

  getMetrics(): Record<string, { legacy: number; modern: number }> {
    return Object.fromEntries(this.metrics);
  }
}
