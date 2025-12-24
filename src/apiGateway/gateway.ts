export interface GatewayConfig { port: number; timeout: number; rateLimit: { requests: number; window: number }; }
export interface Route { path: string; method: string; target: string; middleware: string[]; }
export class Gateway {
  private config: GatewayConfig = { port: 8080, timeout: 30000, rateLimit: { requests: 100, window: 60000 } };
  private routes: Route[] = [];
  configure(config: Partial<GatewayConfig>): void { Object.assign(this.config, config); }
  addRoute(route: Route): void { this.routes.push(route); }
  removeRoute(path: string, method: string): void { this.routes = this.routes.filter(r => !(r.path === path && r.method === method)); }
  findRoute(path: string, method: string): Route | undefined { return this.routes.find(r => r.path === path && r.method === method); }
  getRoutes(): Route[] { return [...this.routes]; }
}
export const gateway = new Gateway();
