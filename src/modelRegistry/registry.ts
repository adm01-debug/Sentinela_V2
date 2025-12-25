/**
 * @fileoverview Model registry
 * @module @sentinela/core/modelRegistry
 * @version 13.0.0
 */

import { Model, ModelVersion, ModelStage } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ModelRegistry {
  private models: Map<string, Model> = new Map();
  private versions: Map<string, ModelVersion[]> = new Map();
  
  register(model: Omit<Model, 'id'>): Model {
    const m: Model = { id: uuidv4(), ...model };
    this.models.set(m.id, m);
    this.versions.set(m.id, [{ modelId: m.id, version: m.version, stage: 'development', createdAt: new Date() }]);
    return m;
  }
  
  get(id: string): Model | undefined { return this.models.get(id); }
  getByName(name: string): Model | undefined { return Array.from(this.models.values()).find(m => m.name === name); }
  
  listVersions(modelId: string): ModelVersion[] { return this.versions.get(modelId) ?? []; }
  
  transitionStage(modelId: string, version: string, stage: ModelStage): void {
    const versions = this.versions.get(modelId);
    const v = versions?.find(v => v.version === version);
    if (v) v.stage = stage;
  }
  
  getProductionModel(name: string): Model | undefined {
    const model = this.getByName(name);
    if (!model) return undefined;
    const versions = this.versions.get(model.id);
    const prod = versions?.find(v => v.stage === 'production');
    return prod ? model : undefined;
  }
}