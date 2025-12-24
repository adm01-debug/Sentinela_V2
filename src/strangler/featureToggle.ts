// Feature Toggle for Migration
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercent: number;
  userGroups: string[];
  metadata: Record<string, unknown>;
}

export class FeatureToggleManager {
  private flags: Map<string, FeatureFlag> = new Map();

  register(flag: FeatureFlag): void {
    this.flags.set(flag.name, flag);
  }

  isEnabled(name: string, context?: { userId?: string; userGroup?: string }): boolean {
    const flag = this.flags.get(name);
    if (!flag || !flag.enabled) return false;

    if (context?.userGroup && flag.userGroups.length > 0) {
      if (!flag.userGroups.includes(context.userGroup)) return false;
    }

    if (flag.rolloutPercent < 100) {
      const hash = context?.userId ? this.hashString(context.userId + name) : Math.random();
      return hash * 100 < flag.rolloutPercent;
    }

    return true;
  }

  setEnabled(name: string, enabled: boolean): void {
    const flag = this.flags.get(name);
    if (flag) flag.enabled = enabled;
  }

  setRolloutPercent(name: string, percent: number): void {
    const flag = this.flags.get(name);
    if (flag) flag.rolloutPercent = Math.max(0, Math.min(100, percent));
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) / 2147483647;
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
}
