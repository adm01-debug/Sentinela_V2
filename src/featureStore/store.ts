/**
 * @fileoverview Feature Store
 * @module @sentinela/core/featureStore
 */
export interface Feature { name: string; version: number; vector: number[]; }
export class FeatureStore {
  private features = new Map<string, Feature>();
  async register(feature: Feature): Promise<void> { this.features.set(feature.name, feature); }
  async get(name: string): Promise<Feature | undefined> { return this.features.get(name); }
  async getVector(name: string): Promise<number[] | undefined> { return this.features.get(name)?.vector; }
}
