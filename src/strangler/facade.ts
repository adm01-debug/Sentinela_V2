import { StranglerConfig, StranglerRoute } from './types';

export class StranglerFacade {
  constructor(private config: StranglerConfig) {}
  
  async route(path: string, request: unknown): Promise<unknown> {
    const route = this.findRoute(path);
    if (!route) return this.forwardToLegacy(path, request);
    switch (route.target) {
      case 'new': return this.forwardToNew(path, request);
      case 'legacy': return this.forwardToLegacy(path, request);
      case 'split': return this.splitTraffic(path, request, route.splitRatio ?? 0.5);
    }
  }
  
  private findRoute(path: string): StranglerRoute | undefined {
    return this.config.routes.find(r => path.startsWith(r.path));
  }
  
  private async forwardToNew(path: string, request: unknown): Promise<unknown> {
    console.log('Forwarding to new service:', path);
    return { target: 'new', path };
  }
  
  private async forwardToLegacy(path: string, request: unknown): Promise<unknown> {
    console.log('Forwarding to legacy:', path);
    return { target: 'legacy', path };
  }
  
  private async splitTraffic(path: string, request: unknown, ratio: number): Promise<unknown> {
    return Math.random() < ratio ? this.forwardToNew(path, request) : this.forwardToLegacy(path, request);
  }
}