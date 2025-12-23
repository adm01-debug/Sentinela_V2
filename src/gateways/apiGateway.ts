import { httpGateway } from './httpGateway';
import { CircuitBreaker } from '@/circuitBreaker/CircuitBreaker';
import { RateLimiter } from '@/rateLimiter/RateLimiter';
export class ApiGateway {
  private breaker = new CircuitBreaker();
  private limiter = new RateLimiter(100, 60000);
  async request<T>(method: string, url: string, data?: any): Promise<T> {
    if (!this.limiter.tryAcquire()) throw new Error('Rate limit exceeded');
    return this.breaker.execute(() => {
      switch (method) { case 'GET': return httpGateway.get<T>(url, data); case 'POST': return httpGateway.post<T>(url, data); case 'PUT': return httpGateway.put<T>(url, data); case 'DELETE': return httpGateway.delete<T>(url); default: throw new Error('Invalid method'); }
    });
  }
}
export const apiGateway = new ApiGateway();
