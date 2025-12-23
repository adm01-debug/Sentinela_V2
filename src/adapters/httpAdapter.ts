export interface HttpConfig { baseUrl: string; timeout: number; headers?: Record<string, string>; }
export class HttpAdapter {
  private config: HttpConfig;
  constructor(config: HttpConfig) { this.config = config; }
  async get<T>(path: string): Promise<T> { const response = await fetch(this.config.baseUrl + path, { headers: this.config.headers }); if (!response.ok) throw new Error('HTTP error: ' + response.status); return response.json(); }
  async post<T>(path: string, body: any): Promise<T> { const response = await fetch(this.config.baseUrl + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...this.config.headers }, body: JSON.stringify(body) }); if (!response.ok) throw new Error('HTTP error: ' + response.status); return response.json(); }
}
export const createHttpAdapter = (config: HttpConfig) => new HttpAdapter(config);
