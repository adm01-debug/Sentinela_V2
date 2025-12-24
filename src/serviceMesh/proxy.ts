import { TrafficConfig } from './types';

export class TrafficProxy {
  constructor(private config: TrafficConfig) {}
  
  async forward(target: string, request: unknown): Promise<unknown> {
    let lastError: Error | undefined;
    for (let i = 0; i <= this.config.retries; i++) {
      try {
        return await this.makeRequest(target, request);
      } catch (e) { lastError = e as Error; }
    }
    throw lastError;
  }
  
  private async makeRequest(target: string, request: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout')), this.config.timeout);
      Promise.resolve({ target, request }).then(r => { clearTimeout(timer); resolve(r); });
    });
  }
}

export class CircuitBreaker {
  private failures: number = 0;
  private lastFailure?: Date;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(private threshold: number, private timeoutMs: number) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.lastFailure && Date.now() - this.lastFailure.getTime() > this.timeoutMs) {
        this.state = 'half-open';
      } else { throw new Error('Circuit breaker is open'); }
    }
    try {
      const result = await fn();
      if (this.state === 'half-open') { this.state = 'closed'; this.failures = 0; }
      return result;
    } catch (e) {
      this.failures++;
      this.lastFailure = new Date();
      if (this.failures >= this.threshold) this.state = 'open';
      throw e;
    }
  }
}