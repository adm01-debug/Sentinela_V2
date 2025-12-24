import { CSRFConfig, CSRFToken } from './types';
import { CSRFTokenStore } from './tokenStore';
import { v4 as uuidv4 } from 'uuid';

export class CSRFProtection {
  private store: CSRFTokenStore;
  
  constructor(private config: CSRFConfig, store?: CSRFTokenStore) {
    this.store = store ?? new CSRFTokenStore();
  }
  
  generateToken(sessionId: string): CSRFToken {
    const token: CSRFToken = {
      token: this.generateSecureToken(),
      sessionId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.ttlSeconds * 1000),
      used: false
    };
    this.store.save(token);
    return token;
  }
  
  validateToken(sessionId: string, token: string): ValidationResult {
    const stored = this.store.get(token);
    
    if (!stored) return { valid: false, reason: 'Token not found' };
    if (stored.sessionId !== sessionId) return { valid: false, reason: 'Session mismatch' };
    if (stored.expiresAt < new Date()) return { valid: false, reason: 'Token expired' };
    if (stored.used) return { valid: false, reason: 'Token already used' };
    
    stored.used = true;
    this.store.save(stored);
    return { valid: true };
  }
  
  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: this.config.tokenLength }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  getCookieOptions(): CookieOptions {
    return { httpOnly: true, secure: true, sameSite: this.config.sameSite, path: '/' };
  }
}

export interface ValidationResult { valid: boolean; reason?: string; }
export interface CookieOptions { httpOnly: boolean; secure: boolean; sameSite: string; path: string; }