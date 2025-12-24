// Sidecar Proxy Pattern
import { ServiceProxy, ProxyConfig } from "./proxy";

export interface SidecarConfig {
  serviceName: string;
  inboundPort: number;
  outboundPort: number;
  upstreams: Record<string, ProxyConfig>;
}

export class Sidecar {
  private proxies: Map<string, ServiceProxy> = new Map();
  private running = false;

  constructor(private config: SidecarConfig) {
    for (const [name, proxyConfig] of Object.entries(config.upstreams)) {
      this.proxies.set(name, new ServiceProxy(proxyConfig));
    }
  }

  async handleInbound(request: Request): Promise<Response> {
    console.log(\`[Sidecar] Inbound: \${request.method} \${request.url}\`);
    return new Response("OK", { status: 200 });
  }

  async handleOutbound(serviceName: string, request: Request): Promise<Response> {
    const proxy = this.proxies.get(serviceName);
    if (!proxy) throw new Error(\`Unknown service: \${serviceName}\`);
    console.log(\`[Sidecar] Outbound to \${serviceName}: \${request.method}\`);
    return proxy.forward(request);
  }

  start(): void {
    this.running = true;
    console.log(\`[Sidecar] Started for \${this.config.serviceName}\`);
  }

  stop(): void {
    this.running = false;
    console.log(\`[Sidecar] Stopped\`);
  }

  getProxyMetrics(serviceName: string) {
    return this.proxies.get(serviceName)?.getMetrics();
  }
}
