/**
 * @fileoverview Model Registry
 * @module @sentinela/core/modelRegistry
 */
export interface Model { id: string; name: string; version: string; artifact: string; }
export class ModelRegistry {
  private models = new Map<string, Model>();
  async register(model: Model): Promise<void> { this.models.set(model.id, model); }
  async get(id: string): Promise<Model | undefined> { return this.models.get(id); }
  async list(): Promise<Model[]> { return Array.from(this.models.values()); }
}
