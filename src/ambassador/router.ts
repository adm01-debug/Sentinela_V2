import { RouteConfig } from './types';

export class DynamicRouter {
  private routes: RouteConfig[] = [];
  
  addRoute(route: RouteConfig): void { this.routes.push(route); }
  removeRoute(path: string): void { this.routes = this.routes.filter(r => r.path !== path); }
  
  match(method: string, path: string): RouteConfig | undefined {
    return this.routes.find(r => this.matchPath(r.path, path) && r.methods.includes(method));
  }
  
  private matchPath(pattern: string, path: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
    return regex.test(path);
  }
  
  getRoutes(): RouteConfig[] { return [...this.routes]; }
}