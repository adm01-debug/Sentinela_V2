/**
 * @fileoverview Feature store
 * @module @sentinela/core/featureStore
 * @version 13.0.0
 */

import { Feature, FeatureValue, FeatureSet } from './types';
import { v4 as uuidv4 } from 'uuid';

export class FeatureStore {
  private features: Map<string, Feature> = new Map();
  private values: Map<string, FeatureValue[]> = new Map();
  private sets: Map<string, FeatureSet> = new Map();
  
  registerFeature(feature: Omit<Feature, 'id'>): Feature {
    const f: Feature = { id: uuidv4(), ...feature };
    this.features.set(f.id, f);
    return f;
  }
  
  ingest(featureId: string, entityId: string, value: unknown): void {
    const key = featureId + ':' + entityId;
    const values = this.values.get(key) ?? [];
    values.push({ featureId, entityId, value, timestamp: new Date() });
    this.values.set(key, values);
  }
  
  getLatest(featureId: string, entityId: string): FeatureValue | undefined {
    const key = featureId + ':' + entityId;
    const values = this.values.get(key);
    return values?.[values.length - 1];
  }
  
  getHistorical(featureId: string, entityId: string, from: Date, to: Date): FeatureValue[] {
    const key = featureId + ':' + entityId;
    return (this.values.get(key) ?? []).filter(v => v.timestamp >= from && v.timestamp <= to);
  }
  
  createFeatureSet(name: string, featureIds: string[]): FeatureSet {
    const set: FeatureSet = { id: uuidv4(), name, features: featureIds };
    this.sets.set(set.id, set);
    return set;
  }
}