/**
 * @fileoverview API Gateway
 * @module @sentinela/core/apiGateway
 */
export interface Route { path: string; target: string; rateLimit?: number; }
export class APIGateway {
  private routes: Route[] = [];
  addRoute(route: Route): void { this.routes.push(route); }
  findRoute(path: string): Route | undefined { return this.routes.find(r => path.startsWith(r.path)); }
  async forward(path: string): Promise<{ target: string } | null> {
    const route = this.findRoute(path);
    return route ? { target: route.target } : null;
  }
}
