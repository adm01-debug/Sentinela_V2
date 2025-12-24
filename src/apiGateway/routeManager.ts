import { Route, gateway } from './gateway';
export class RouteManager {
  register(path: string, method: string, target: string, middleware: string[] = []): void { gateway.addRoute({ path, method, target, middleware }); }
  unregister(path: string, method: string): void { gateway.removeRoute(path, method); }
  get(path: string, target: string): void { this.register(path, 'GET', target); }
  post(path: string, target: string): void { this.register(path, 'POST', target); }
  put(path: string, target: string): void { this.register(path, 'PUT', target); }
  delete(path: string, target: string): void { this.register(path, 'DELETE', target); }
  list(): Route[] { return gateway.getRoutes(); }
}
export const routeManager = new RouteManager();
