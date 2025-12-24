import { CSRFConfig } from './types';

export class DoubleSubmitValidator {
  constructor(private config: CSRFConfig) {}
  
  validate(headerValue?: string, cookieValue?: string): ValidationResult {
    if (!headerValue) return { valid: false, reason: 'Missing header token' };
    if (!cookieValue) return { valid: false, reason: 'Missing cookie token' };
    if (headerValue !== cookieValue) return { valid: false, reason: 'Token mismatch' };
    return { valid: true };
  }
}

export class SynchronizerTokenValidator {
  private serverTokens: Map<string, string> = new Map();
  
  storeToken(sessionId: string, token: string): void { this.serverTokens.set(sessionId, token); }
  
  validate(sessionId: string, token: string): ValidationResult {
    const stored = this.serverTokens.get(sessionId);
    if (!stored) return { valid: false, reason: 'No token for session' };
    if (stored !== token) return { valid: false, reason: 'Invalid token' };
    return { valid: true };
  }
}

export interface ValidationResult { valid: boolean; reason?: string; }