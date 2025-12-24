import { InferenceRequest, InferenceResponse, ServingConfig } from './types';

export class ModelServer {
  private models: Map<string, LoadedModel> = new Map();
  
  constructor(private config: ServingConfig) {}
  
  loadModel(modelId: string, model: LoadedModel): void { this.models.set(modelId, model); }
  unloadModel(modelId: string): void { this.models.delete(modelId); }
  
  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const model = this.models.get(request.modelId);
    if (!model) throw new Error('Model not loaded: ' + request.modelId);
    
    const start = Date.now();
    const outputs = await model.predict(request.inputs);
    return { modelId: request.modelId, outputs, latency: Date.now() - start };
  }
  
  getLoadedModels(): string[] { return Array.from(this.models.keys()); }
  
  getStats(): ServerStats {
    return { loadedModels: this.models.size, config: this.config };
  }
}

export interface LoadedModel { predict: (inputs: unknown[]) => Promise<unknown[]>; }
export interface ServerStats { loadedModels: number; config: ServingConfig; }