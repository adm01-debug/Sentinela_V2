export interface TrustContext { userId: string; deviceId: string; location: string; timestamp: Date; riskScore: number; }
export interface TrustResult { trusted: boolean; score: number; factors: { name: string; score: number }[]; }
export class TrustVerifier {
  private minimumScore = 70;
  setMinimumScore(score: number): void { this.minimumScore = score; }
  verify(context: TrustContext): TrustResult { const factors = [ { name: 'identity', score: this.verifyIdentity(context) }, { name: 'device', score: this.verifyDevice(context) }, { name: 'location', score: this.verifyLocation(context) }, { name: 'behavior', score: this.verifyBehavior(context) } ]; const total = factors.reduce((sum, f) => sum + f.score, 0) / factors.length; return { trusted: total >= this.minimumScore, score: total, factors }; }
  private verifyIdentity(ctx: TrustContext): number { return ctx.userId ? 100 : 0; }
  private verifyDevice(ctx: TrustContext): number { return ctx.deviceId ? 80 : 20; }
  private verifyLocation(ctx: TrustContext): number { return 70; }
  private verifyBehavior(ctx: TrustContext): number { return Math.max(0, 100 - ctx.riskScore); }
}
export const trustVerifier = new TrustVerifier();
