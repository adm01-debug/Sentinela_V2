import { SecurityHeadersConfig } from './types';

export const SecurityPresets: Record<string, SecurityHeadersConfig> = {
  strict: {
    csp: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"] },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    xfo: 'DENY',
    xcto: true,
    xxss: true,
    referrer: 'strict-origin-when-cross-origin'
  },
  moderate: {
    csp: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"], styleSrc: ["'self'", "'unsafe-inline'"] },
    hsts: { maxAge: 86400 },
    xfo: 'SAMEORIGIN',
    xcto: true,
    referrer: 'same-origin'
  },
  relaxed: {
    xfo: 'SAMEORIGIN',
    xcto: true
  }
};

export class PolicyBuilder {
  private config: SecurityHeadersConfig = {};
  
  usePreset(name: keyof typeof SecurityPresets): this {
    this.config = { ...SecurityPresets[name] };
    return this;
  }
  
  addCSPDirective(directive: string, values: string[]): this {
    if (!this.config.csp) this.config.csp = { defaultSrc: ["'self'"] };
    (this.config.csp as any)[directive] = values;
    return this;
  }
  
  enableHSTS(maxAge: number, options?: { includeSubDomains?: boolean; preload?: boolean }): this {
    this.config.hsts = { maxAge, ...options };
    return this;
  }
  
  build(): SecurityHeadersConfig { return { ...this.config }; }
}