import { experimentManager } from './experimentManager';
export class ABTest {
  private experimentId: string;
  private userVariants = new Map<string, string>();
  constructor(experimentId: string) { this.experimentId = experimentId; }
  getVariant(userId: string): string | null { if (!experimentManager.isActive(this.experimentId)) return null; if (this.userVariants.has(userId)) return this.userVariants.get(userId)!; const exp = experimentManager.get(this.experimentId); if (!exp) return null; const hash = this.hashUserId(userId); const variantIndex = hash % exp.variants.length; const variant = exp.variants[variantIndex]; this.userVariants.set(userId, variant); return variant; }
  private hashUserId(userId: string): number { let hash = 0; for (let i = 0; i < userId.length; i++) { hash = ((hash << 5) - hash) + userId.charCodeAt(i); hash |= 0; } return Math.abs(hash); }
}
export function createABTest(experimentId: string): ABTest { return new ABTest(experimentId); }
