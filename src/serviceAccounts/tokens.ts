import { TokenRequest, TokenResponse } from './types';

export class TokenManager {
  private tokens: Map<string, TokenData> = new Map();
  
  createToken(namespace: string, serviceAccountName: string, request: TokenRequest): TokenResponse {
    const token = this.generateToken(namespace, serviceAccountName);
    const expiration = new Date(Date.now() + (request.expirationSeconds ?? 3600) * 1000);
    
    this.tokens.set(token, { namespace, serviceAccount: serviceAccountName, audiences: request.audience ?? [], expiration, boundObject: request.boundObjectRef });
    
    return { token, expirationTimestamp: expiration };
  }
  
  validateToken(token: string): TokenValidation {
    const data = this.tokens.get(token);
    if (!data) return { valid: false, reason: 'Token not found' };
    if (data.expiration < new Date()) return { valid: false, reason: 'Token expired' };
    return { valid: true, namespace: data.namespace, serviceAccount: data.serviceAccount };
  }
  
  revokeToken(token: string): boolean { return this.tokens.delete(token); }
  
  private generateToken(namespace: string, sa: string): string {
    return Buffer.from(JSON.stringify({ ns: namespace, sa, iat: Date.now(), r: Math.random() })).toString('base64');
  }
}

interface TokenData { namespace: string; serviceAccount: string; audiences: string[]; expiration: Date; boundObject?: { kind: string; name: string; uid: string }; }
export interface TokenValidation { valid: boolean; reason?: string; namespace?: string; serviceAccount?: string; }