import { SecurityHeadersMiddleware } from '../../securityHeaders';

describe('SecurityHeadersMiddleware', () => {
  it('should add security headers', () => {
    const middleware = new SecurityHeadersMiddleware();
    const headers = middleware.getHeaders();
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
  });
});
