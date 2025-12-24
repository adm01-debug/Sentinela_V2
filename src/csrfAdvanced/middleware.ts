import { CSRFConfig } from './types';
import { CSRFTokenManager } from './tokenManager';

export class CSRFMiddleware {
  private manager: CSRFTokenManager;
  
  constructor(private config: CSRFConfig) { this.manager = new CSRFTokenManager(config); }
  
  handle(request: CSRFRequest, response: CSRFResponse): boolean {
    if (!this.config.methods.includes(request.method)) {
      const token = this.manager.generate(request.sessionId);
      response.setCookie(this.config.cookieName, token.token);
      return true;
    }
    
    const headerToken = request.headers[this.config.headerName.toLowerCase()];
    const cookieToken = request.cookies[this.config.cookieName];
    
    if (!headerToken || headerToken !== cookieToken) return false;
    return this.manager.validate(headerToken, request.sessionId);
  }
}

export interface CSRFRequest { method: string; sessionId: string; headers: Record<string, string>; cookies: Record<string, string>; }
export interface CSRFResponse { setCookie: (name: string, value: string) => void; }