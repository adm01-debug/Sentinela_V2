export interface FeatureFlag { name: string; enabled: boolean; percentage?: number; userIds?: string[]; }
export class FeatureFlagService {
  private flags = new Map<string, FeatureFlag>();
  set(flag: FeatureFlag): void { this.flags.set(flag.name, flag); }
  isEnabled(name: string, userId?: string): boolean { const flag = this.flags.get(name); if (!flag) return false; if (!flag.enabled) return false; if (flag.userIds?.length && userId) return flag.userIds.includes(userId); if (flag.percentage !== undefined) return Math.random() * 100 < flag.percentage; return true; }
  getAll(): FeatureFlag[] { return Array.from(this.flags.values()); }
  remove(name: string): void { this.flags.delete(name); }
}
export const featureFlagService = new FeatureFlagService();
