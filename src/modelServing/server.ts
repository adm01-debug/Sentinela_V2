/**
 * @fileoverview Model Serving
 * @module @sentinela/core/modelServing
 */
export interface ModelConfig { name: string; version: string; endpoint: string; }
export class ModelServer {
  private models = new Map<string, ModelConfig>();
  deploy(model: ModelConfig): void { this.models.set(model.name, model); }
  async predict(modelName: string, input: unknown): Promise<unknown> {
    const model = this.models.get(modelName);
    if (!model) throw new Error('Model not found');
    return { prediction: 'mock', model: modelName };
  }
  undeploy(name: string): void { this.models.delete(name); }
  list(): ModelConfig[] { return Array.from(this.models.values()); }
}
