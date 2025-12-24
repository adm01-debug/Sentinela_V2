import { StranglerRoute } from './types';

export class StranglerRouter {
  private routes: Map<string, StranglerRoute> = new Map();
  
  addRoute(route: StranglerRoute): void { this.routes.set(route.path, route); }
  
  updateTarget(path: string, target: 'legacy' | 'new' | 'split', splitRatio?: number): void {
    const route = this.routes.get(path);
    if (route) { route.target = target; route.splitRatio = splitRatio; }
  }
  
  getRoute(path: string): StranglerRoute | undefined { return this.routes.get(path); }
  getAllRoutes(): StranglerRoute[] { return Array.from(this.routes.values()); }
}