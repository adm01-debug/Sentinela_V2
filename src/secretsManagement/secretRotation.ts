import { vault, Secret } from './vault';
export interface RotationPolicy { key: string; intervalDays: number; lastRotated: Date; generator: () => string; }
export class SecretRotation {
  private policies = new Map<string, RotationPolicy>();
  addPolicy(key: string, intervalDays: number, generator: () => string): void { this.policies.set(key, { key, intervalDays, lastRotated: new Date(), generator }); }
  needsRotation(key: string): boolean { const policy = this.policies.get(key); if (!policy) return false; const daysSince = (Date.now() - policy.lastRotated.getTime()) / 86400000; return daysSince >= policy.intervalDays; }
  rotate(key: string): string | null { const policy = this.policies.get(key); if (!policy) return null; const newValue = policy.generator(); vault.store(key, newValue); policy.lastRotated = new Date(); return newValue; }
  rotateAll(): { rotated: string[]; skipped: string[] } { const rotated: string[] = [], skipped: string[] = []; this.policies.forEach((_, key) => { if (this.needsRotation(key)) { this.rotate(key); rotated.push(key); } else { skipped.push(key); } }); return { rotated, skipped }; }
}
export const secretRotation = new SecretRotation();
