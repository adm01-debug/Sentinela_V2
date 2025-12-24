export interface FakeEndpoint { path: string; method: string; response: any; delay?: number; }
export class FakeEndpointManager {
  private endpoints = new Map<string, FakeEndpoint>();
  private accessLog: { path: string; ip: string; timestamp: Date; userAgent: string }[] = [];
  register(endpoint: FakeEndpoint): void { this.endpoints.set(endpoint.method + ':' + endpoint.path, endpoint); }
  async handle(method: string, path: string, ip: string, userAgent: string): Promise<any> { const key = method + ':' + path; const endpoint = this.endpoints.get(key); if (endpoint) { this.accessLog.push({ path, ip, timestamp: new Date(), userAgent }); if (endpoint.delay) await new Promise(r => setTimeout(r, endpoint.delay)); return endpoint.response; } return null; }
  getAccessLog(): typeof this.accessLog { return [...this.accessLog]; }
}
export const fakeEndpointManager = new FakeEndpointManager();
