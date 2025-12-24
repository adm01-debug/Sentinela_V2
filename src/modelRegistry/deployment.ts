import { Model, ModelStage } from './types';
import { ModelRegistry } from './registry';

export class ModelDeployer {
  constructor(private registry: ModelRegistry) {}
  
  async deploy(modelId: string, version: string, target: DeploymentTarget): Promise<Deployment> {
    const model = this.registry.get(modelId);
    if (!model) throw new Error('Model not found');
    
    this.registry.transitionStage(modelId, version, 'staging');
    await new Promise(r => setTimeout(r, 100));
    this.registry.transitionStage(modelId, version, 'production');
    
    return { modelId, version, target, status: 'deployed', deployedAt: new Date() };
  }
  
  async rollback(modelId: string, toVersion: string): Promise<void> {
    const versions = this.registry.listVersions(modelId);
    const current = versions.find(v => v.stage === 'production');
    if (current) this.registry.transitionStage(modelId, current.version, 'archived');
    this.registry.transitionStage(modelId, toVersion, 'production');
  }
}

export interface DeploymentTarget { type: 'endpoint' | 'batch' | 'edge'; config: Record<string, unknown>; }
export interface Deployment { modelId: string; version: string; target: DeploymentTarget; status: string; deployedAt: Date; }