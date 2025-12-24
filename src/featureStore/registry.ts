import { Feature } from './types';

export class FeatureRegistry {
  private features: Map<string, Feature> = new Map();
  private metadata: Map<string, FeatureMetadata> = new Map();
  
  register(feature: Feature, meta?: FeatureMetadata): void {
    this.features.set(feature.id, feature);
    if (meta) this.metadata.set(feature.id, meta);
  }
  
  get(id: string): Feature | undefined { return this.features.get(id); }
  getByName(name: string): Feature | undefined { return Array.from(this.features.values()).find(f => f.name === name); }
  getByEntity(entity: string): Feature[] { return Array.from(this.features.values()).filter(f => f.entity === entity); }
  
  search(query: string): Feature[] {
    const lower = query.toLowerCase();
    return Array.from(this.features.values()).filter(f => f.name.toLowerCase().includes(lower) || f.description.toLowerCase().includes(lower));
  }
  
  getMetadata(id: string): FeatureMetadata | undefined { return this.metadata.get(id); }
}

export interface FeatureMetadata { owner: string; tags: string[]; createdAt: Date; updatedAt: Date; }