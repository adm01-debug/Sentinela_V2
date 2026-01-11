import { generateToken } from './encryption';

const tokenStore = new Map<string, { token: string; expiresAt: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = generateToken(32);
  tokenStore.set(sessionId, { token, expiresAt: Date.now() + 3600000 });
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId);
  if (!stored) return false;
  if (stored.expiresAt < Date.now()) {
    tokenStore.delete(sessionId);
    return false;
  }
  return stored.token === token;
}

export function refreshCSRFToken(sessionId: string): string {
  tokenStore.delete(sessionId);
  return generateCSRFToken(sessionId);
}
