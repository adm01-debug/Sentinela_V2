/**
 * @fileoverview Model Registry
 * @module @sentinela/core/modelRegistry
 * @version 13.0.0
 */
export interface Model { name: string; version: string; path: string; metadata?: Record<string, string>; }
export class ModelRegistry {
  private models = new Map<string, Model[]>();
  async register(model: Model): Promise<void> {
    const versions = this.models.get(model.name) ?? [];
    versions.push(model);
    this.models.set(model.name, versions);
  }
  async getLatest(name: string): Promise<Model | undefined> {
    const versions = this.models.get(name) ?? [];
    return versions[versions.length - 1];
  }
}
