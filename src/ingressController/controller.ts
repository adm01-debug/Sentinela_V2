import { Ingress } from './types';

export class IngressController {
  private ingresses: Map<string, Ingress> = new Map();
  
  apply(ingress: Ingress): void { this.ingresses.set(this.key(ingress), ingress); this.reconcile(); }
  delete(namespace: string, name: string): void { this.ingresses.delete(namespace + '/' + name); this.reconcile(); }
  get(namespace: string, name: string): Ingress | undefined { return this.ingresses.get(namespace + '/' + name); }
  list(namespace?: string): Ingress[] {
    const all = Array.from(this.ingresses.values());
    return namespace ? all.filter(i => i.namespace === namespace) : all;
  }
  
  private key(ingress: Ingress): string { return ingress.namespace + '/' + ingress.name; }
  
  private reconcile(): void {
    console.log('Reconciling', this.ingresses.size, 'ingresses');
  }
  
  getRoutes(): Route[] {
    const routes: Route[] = [];
    this.ingresses.forEach(ingress => {
      ingress.rules.forEach(rule => {
        rule.http.paths.forEach(path => {
          routes.push({ host: rule.host, path: path.path, pathType: path.pathType, backend: path.backend.service.name + ':' + path.backend.service.port.number });
        });
      });
    });
    return routes;
  }
}

export interface Route { host: string; path: string; pathType: string; backend: string; }