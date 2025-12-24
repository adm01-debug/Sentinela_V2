import { FeatureStore } from './store';
import { FeatureValue } from './types';

export class FeatureServer {
  constructor(private store: FeatureStore) {}
  
  async getOnlineFeatures(entityId: string, featureIds: string[]): Promise<Map<string, unknown>> {
    const result = new Map<string, unknown>();
    for (const fid of featureIds) {
      const value = this.store.getLatest(fid, entityId);
      if (value) result.set(fid, value.value);
    }
    return result;
  }
  
  async getBatchFeatures(entityIds: string[], featureIds: string[]): Promise<Map<string, Map<string, unknown>>> {
    const result = new Map<string, Map<string, unknown>>();
    for (const eid of entityIds) {
      result.set(eid, await this.getOnlineFeatures(eid, featureIds));
    }
    return result;
  }
}

export class FeatureCache {
  private cache: Map<string, { value: unknown; expiry: Date }> = new Map();
  
  set(key: string, value: unknown, ttlMs: number): void {
    this.cache.set(key, { value, expiry: new Date(Date.now() + ttlMs) });
  }
  
  get(key: string): unknown | undefined {
    const entry = this.cache.get(key);
    if (!entry || entry.expiry < new Date()) { this.cache.delete(key); return undefined; }
    return entry.value;
  }
}