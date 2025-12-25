import { SecurityHeadersMiddleware } from '../../securityHeaders';
describe('SecurityHeadersMiddleware', () => {
  it('should set security headers', () => {
    const middleware = new SecurityHeadersMiddleware({ csp: "default-src 'self'", xFrameOptions: 'DENY', hsts: true });
    const headers = middleware.getHeaders();
    expect(headers['Content-Security-Policy']).toBe("default-src 'self'");
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Strict-Transport-Security']).toBeDefined();
  });
});
