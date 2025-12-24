export interface NetworkRequest { id: string; url: string; method: string; startTime: number; endTime: number; size: number; status: number; }
export class NetworkProfiler {
  private requests: NetworkRequest[] = [];
  record(request: Omit<NetworkRequest, 'id'>): void { this.requests.push({ ...request, id: crypto.randomUUID() }); }
  getRequests(): NetworkRequest[] { return [...this.requests]; }
  getSlowRequests(thresholdMs = 1000): NetworkRequest[] { return this.requests.filter(r => (r.endTime - r.startTime) > thresholdMs); }
  getStats(): { totalRequests: number; avgDuration: number; totalSize: number } { const total = this.requests.length; const avgDuration = this.requests.reduce((sum, r) => sum + (r.endTime - r.startTime), 0) / total; const totalSize = this.requests.reduce((sum, r) => sum + r.size, 0); return { totalRequests: total, avgDuration, totalSize }; }
  clear(): void { this.requests = []; }
}
export const networkProfiler = new NetworkProfiler();
