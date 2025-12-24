export interface AuthSession { id: string; userId: string; startedAt: Date; lastVerified: Date; trustScore: number; active: boolean; }
export class ContinuousAuth {
  private sessions = new Map<string, AuthSession>();
  private verifyInterval = 300000;
  setVerifyInterval(ms: number): void { this.verifyInterval = ms; }
  createSession(userId: string): AuthSession { const session: AuthSession = { id: crypto.randomUUID(), userId, startedAt: new Date(), lastVerified: new Date(), trustScore: 100, active: true }; this.sessions.set(session.id, session); return session; }
  needsReverification(sessionId: string): boolean { const session = this.sessions.get(sessionId); if (!session || !session.active) return true; return Date.now() - session.lastVerified.getTime() > this.verifyInterval; }
  verify(sessionId: string, trustScore: number): boolean { const session = this.sessions.get(sessionId); if (!session) return false; session.lastVerified = new Date(); session.trustScore = trustScore; session.active = trustScore >= 50; return session.active; }
  terminate(sessionId: string): void { const session = this.sessions.get(sessionId); if (session) session.active = false; }
}
export const continuousAuth = new ContinuousAuth();
