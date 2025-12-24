import { IngressController, Route } from './controller';

export class IngressRouter {
  constructor(private controller: IngressController) {}
  
  route(host: string, path: string): RouteMatch | undefined {
    const routes = this.controller.getRoutes().filter(r => r.host === host || r.host === '*');
    
    for (const route of routes) {
      if (this.matchPath(path, route.path, route.pathType)) {
        return { backend: route.backend, matched: route.path };
      }
    }
    return undefined;
  }
  
  private matchPath(requestPath: string, rulePath: string, pathType: string): boolean {
    if (pathType === 'Exact') return requestPath === rulePath;
    if (pathType === 'Prefix') return requestPath.startsWith(rulePath);
    return requestPath.startsWith(rulePath);
  }
}

export interface RouteMatch { backend: string; matched: string; }