import { FeatureFlag } from './featureFlagService';
export class FlagStorage {
  private storageKey = 'feature_flags';
  save(flags: FeatureFlag[]): void { localStorage.setItem(this.storageKey, JSON.stringify(flags)); }
  load(): FeatureFlag[] { const stored = localStorage.getItem(this.storageKey); return stored ? JSON.parse(stored) : []; }
  clear(): void { localStorage.removeItem(this.storageKey); }
}
export const flagStorage = new FlagStorage();
