export interface APIGateway { name: string; routes: Route[]; plugins: Plugin[]; }
export interface Route { path: string; methods: string[]; upstream: Upstream; plugins?: string[]; }
export interface Upstream { service: string; port: number; timeout?: number; retries?: number; }
export interface Plugin { name: string; config: Record<string, unknown>; }
export interface Request { method: string; path: string; headers: Record<string, string>; body?: unknown; }
export interface Response { status: number; headers: Record<string, string>; body?: unknown; }