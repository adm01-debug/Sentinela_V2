import { EdgeFunction } from './types';

export class EdgeRuntime {
  private functions: Map<string, EdgeFunction> = new Map();
  
  register(fn: EdgeFunction): void { this.functions.set(fn.id, fn); }
  
  async execute(functionId: string, request: EdgeRequest): Promise<EdgeResponse> {
    const fn = this.functions.get(functionId);
    if (!fn) return { status: 404, body: 'Function not found' };
    
    try {
      const result = await this.runInSandbox(fn, request);
      return { status: 200, body: result };
    } catch (e) {
      return { status: 500, body: (e as Error).message };
    }
  }
  
  private async runInSandbox(fn: EdgeFunction, request: EdgeRequest): Promise<unknown> {
    return { functionId: fn.id, input: request.body, timestamp: new Date() };
  }
  
  getFunction(id: string): EdgeFunction | undefined { return this.functions.get(id); }
  listFunctions(): EdgeFunction[] { return Array.from(this.functions.values()); }
}

export interface EdgeRequest { method: string; path: string; headers: Record<string, string>; body?: unknown; }
export interface EdgeResponse { status: number; body: unknown; headers?: Record<string, string>; }