import { ServiceMeshConfig, SidecarConfig } from './types';

export class SidecarProxy {
  private config: SidecarConfig;
  private isRunning: boolean = false;
  
  constructor(config: SidecarConfig) { this.config = config; }
  
  start(): void { this.isRunning = true; console.log('Sidecar started on port', this.config.port); }
  stop(): void { this.isRunning = false; console.log('Sidecar stopped'); }
  isActive(): boolean { return this.isRunning; }
  
  async intercept(request: ProxyRequest): Promise<ProxyResponse> {
    console.log('Intercepting request:', request.path);
    return { statusCode: 200, body: {}, headers: {} };
  }
}

export interface ProxyRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface ProxyResponse {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
}