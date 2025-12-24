// Proxy Sidecar
import { SidecarContainer, SidecarConfig } from "./sidecarContainer";

export interface ProxyRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: string;
}

export interface ProxyResponse {
  status: number;
  headers: Record<string, string>;
  body?: string;
}

export class ProxySidecar extends SidecarContainer {
  private interceptors: ((req: ProxyRequest) => ProxyRequest)[] = [];
  private requestCount = 0;

  constructor(config: SidecarConfig, private upstream: string) {
    super(config);
  }

  addInterceptor(fn: (req: ProxyRequest) => ProxyRequest): void {
    this.interceptors.push(fn);
  }

  async proxy(request: ProxyRequest): Promise<ProxyResponse> {
    if (!this.isRunning()) throw new Error("Sidecar not running");
    
    let req = request;
    for (const interceptor of this.interceptors) {
      req = interceptor(req);
    }

    this.requestCount++;
    // Simulate proxy
    return { status: 200, headers: { "x-proxy": "true" }, body: "proxied" };
  }

  getRequestCount(): number { return this.requestCount; }
}
