import { Pipeline, PipelineStage, PipelineConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

export class MLPipeline {
  private stages: PipelineStage[] = [];
  
  constructor(private name: string, private config: PipelineConfig) {}
  
  addStage(stage: Omit<PipelineStage, 'id'>): this {
    this.stages.push({ id: uuidv4(), ...stage });
    return this;
  }
  
  build(): Pipeline {
    return { id: uuidv4(), name: this.name, stages: this.stages, config: this.config };
  }
  
  validate(): ValidationResult {
    const errors: string[] = [];
    if (this.stages.length === 0) errors.push('Pipeline has no stages');
    const hasTraining = this.stages.some(s => s.type === 'training');
    if (!hasTraining) errors.push('Pipeline missing training stage');
    return { valid: errors.length === 0, errors };
  }
}

export interface ValidationResult { valid: boolean; errors: string[]; }