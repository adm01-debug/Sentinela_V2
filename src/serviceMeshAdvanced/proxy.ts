import { VirtualService, HTTPRoute } from './types';

export class SidecarProxy {
  private virtualServices: Map<string, VirtualService> = new Map();
  
  configure(vs: VirtualService): void { this.virtualServices.set(vs.name, vs); }
  
  route(host: string, path: string, headers: Record<string, string>): ProxyRoute | undefined {
    for (const vs of this.virtualServices.values()) {
      if (!vs.hosts.includes(host) && !vs.hosts.includes('*')) continue;
      
      for (const httpRoute of vs.http) {
        if (this.matchRoute(httpRoute, path, headers)) {
          return this.selectDestination(httpRoute);
        }
      }
    }
    return undefined;
  }
  
  private matchRoute(route: HTTPRoute, path: string, headers: Record<string, string>): boolean {
    if (!route.match) return true;
    return route.match.some(m => {
      if (m.uri?.prefix && !path.startsWith(m.uri.prefix)) return false;
      if (m.uri?.exact && path !== m.uri.exact) return false;
      return true;
    });
  }
  
  private selectDestination(route: HTTPRoute): ProxyRoute {
    const totalWeight = route.route.reduce((sum, r) => sum + (r.weight ?? 100), 0);
    let random = Math.random() * totalWeight;
    for (const dest of route.route) {
      random -= dest.weight ?? 100;
      if (random <= 0) return { host: dest.destination.host, port: dest.destination.port?.number ?? 80 };
    }
    return { host: route.route[0].destination.host, port: route.route[0].destination.port?.number ?? 80 };
  }
}

export interface ProxyRoute { host: string; port: number; }