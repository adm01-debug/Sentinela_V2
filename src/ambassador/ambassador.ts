// Ambassador Pattern - API Gateway
export interface AmbassadorConfig {
  name: string;
  targetService: string;
  port: number;
  timeout: number;
  retries: number;
}

export interface RequestContext {
  id: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  startTime: Date;
}

export class Ambassador {
  private requestCount = 0;
  private running = false;

  constructor(private config: AmbassadorConfig) {}

  async start(): Promise<void> {
    this.running = true;
    console.log("[Ambassador] Started for", this.config.targetService);
  }

  async stop(): Promise<void> {
    this.running = false;
    console.log("[Ambassador] Stopped");
  }

  async handle(ctx: RequestContext): Promise<Response> {
    if (!this.running) throw new Error("Ambassador not running");
    this.requestCount++;
    
    // Add tracing headers
    ctx.headers["x-request-id"] = ctx.id;
    ctx.headers["x-forwarded-for"] = "ambassador";
    
    // Forward to target service
    const targetUrl = this.config.targetService + ctx.path;
    return this.forwardWithRetry(targetUrl, ctx);
  }

  private async forwardWithRetry(url: string, ctx: RequestContext): Promise<Response> {
    let lastError: Error | null = null;
    for (let i = 0; i <= this.config.retries; i++) {
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), this.config.timeout);
        return await fetch(url, {
          method: ctx.method, headers: ctx.headers, 
          body: ctx.body ? JSON.stringify(ctx.body) : undefined,
          signal: controller.signal
        });
      } catch (e) { lastError = e as Error; }
    }
    throw lastError;
  }

  getStats(): { requests: number; running: boolean } {
    return { requests: this.requestCount, running: this.running };
  }
}
