import { CSRFConfig } from './types';
import { CSRFProtection, ValidationResult } from './protection';

export class CSRFValidator {
  constructor(private protection: CSRFProtection, private config: CSRFConfig) {}
  
  validateRequest(request: RequestLike): ValidationResult {
    const sessionId = this.extractSessionId(request);
    if (!sessionId) return { valid: false, reason: 'No session' };
    
    const headerToken = request.headers[this.config.headerName.toLowerCase()];
    const cookieToken = this.extractCookieToken(request);
    
    if (this.config.doubleSubmit) {
      if (!headerToken || !cookieToken) return { valid: false, reason: 'Missing tokens' };
      if (headerToken !== cookieToken) return { valid: false, reason: 'Token mismatch' };
    }
    
    const token = headerToken ?? cookieToken;
    if (!token) return { valid: false, reason: 'No token provided' };
    
    return this.protection.validateToken(sessionId, token);
  }
  
  private extractSessionId(request: RequestLike): string | undefined {
    return request.headers['x-session-id'] ?? request.cookies?.['sessionId'];
  }
  
  private extractCookieToken(request: RequestLike): string | undefined {
    return request.cookies?.[this.config.cookieName];
  }
}

export interface RequestLike { headers: Record<string, string>; cookies?: Record<string, string>; }