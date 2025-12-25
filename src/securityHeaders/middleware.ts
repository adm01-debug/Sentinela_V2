/**
 * @fileoverview Security headers middleware
 * @module @sentinela/core/securityHeaders
 * @version 13.0.0
 */

import { SecurityHeaders, HeaderConfig } from './types';

export class SecurityHeadersMiddleware {
  constructor(private config: HeaderConfig) {}
  
  getHeaders(): SecurityHeaders {
    const headers: SecurityHeaders = { 'X-Content-Type-Options': 'nosniff', 'X-XSS-Protection': '1; mode=block', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
    if (this.config.frameOptions) headers['X-Frame-Options'] = this.config.frameOptions;
    if (this.config.enableHSTS) headers['Strict-Transport-Security'] = 'max-age=' + this.config.hstsMaxAge + '; includeSubDomains';
    if (this.config.enableCSP) headers['Content-Security-Policy'] = this.buildCSP();
    return headers;
  }
  
  private buildCSP(): string { return "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"; }
  
  apply(response: { setHeader: (name: string, value: string) => void }): void {
    Object.entries(this.getHeaders()).forEach(([name, value]) => { if (value) response.setHeader(name, value); });
  }
}