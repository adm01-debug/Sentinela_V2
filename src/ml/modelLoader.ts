export interface MLModel { id: string; name: string; version: string; type: 'classification' | 'regression' | 'clustering'; loaded: boolean; }
export class ModelLoader {
  private models = new Map<string, MLModel>();
  async load(name: string, version: string, type: MLModel['type']): Promise<MLModel> { const model: MLModel = { id: crypto.randomUUID(), name, version, type, loaded: true }; this.models.set(model.id, model); console.log('Loading model ' + name + ' v' + version); return model; }
  get(id: string): MLModel | undefined { return this.models.get(id); }
  unload(id: string): void { const model = this.models.get(id); if (model) model.loaded = false; }
  list(): MLModel[] { return Array.from(this.models.values()); }
}
export const modelLoader = new ModelLoader();
