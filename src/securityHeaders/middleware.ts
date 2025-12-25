/**
 * @fileoverview Security Headers Middleware
 * @module @sentinela/core/securityHeaders
 */
export interface SecurityHeadersConfig { csp?: string; xFrameOptions?: string; hsts?: boolean; }
export class SecurityHeadersMiddleware {
  private headers: Record<string, string> = {};
  constructor(config: SecurityHeadersConfig = {}) {
    if (config.csp) this.headers['Content-Security-Policy'] = config.csp;
    if (config.xFrameOptions) this.headers['X-Frame-Options'] = config.xFrameOptions;
    if (config.hsts) this.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
    this.headers['X-Content-Type-Options'] = 'nosniff';
    this.headers['X-XSS-Protection'] = '1; mode=block';
  }
  getHeaders(): Record<string, string> { return { ...this.headers }; }
  apply(res: { setHeader: (k: string, v: string) => void }): void {
    for (const [k, v] of Object.entries(this.headers)) res.setHeader(k, v);
  }
}
