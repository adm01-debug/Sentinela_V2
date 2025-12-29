import { AmbassadorGatewayConfig, RouteConfig } from './types';

export class AmbassadorGateway {
  private config: AmbassadorGatewayConfig;
  private running: boolean = false;
  
  constructor(config: AmbassadorGatewayConfig) { this.config = config; }
  
  start(): void { this.running = true; if (import.meta.env.DEV) console.log('Gateway started on port', this.config.port); }
  stop(): void { this.running = false; }
  
  async handleRequest(method: string, path: string, body?: unknown): Promise<GatewayResponse> {
    const route = this.findRoute(method, path);
    if (!route) return { status: 404, body: { error: 'Not found' } };
    return { status: 200, body: { service: route.service, path } };
  }
  
  private findRoute(method: string, path: string): RouteConfig | undefined {
    return this.config.routes.find(r => r.path === path && r.methods.includes(method));
  }
}

export interface GatewayResponse { status: number; body: unknown; }