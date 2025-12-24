import { CIPipeline, CIStage, Trigger } from './types';
import { v4 as uuidv4 } from 'uuid';

export class PipelineBuilder {
  private pipeline: CIPipeline = { id: uuidv4(), name: '', stages: [], triggers: [], variables: {} };
  
  name(name: string): this { this.pipeline.name = name; return this; }
  addStage(stage: CIStage): this { this.pipeline.stages.push(stage); return this; }
  addTrigger(trigger: Trigger): this { this.pipeline.triggers.push(trigger); return this; }
  setVariable(key: string, value: string): this { this.pipeline.variables[key] = value; return this; }
  
  build(): CIPipeline { return { ...this.pipeline }; }
  
  validate(): ValidationResult {
    const errors: string[] = [];
    if (!this.pipeline.name) errors.push('Pipeline name required');
    if (this.pipeline.stages.length === 0) errors.push('At least one stage required');
    return { valid: errors.length === 0, errors };
  }
}

export interface ValidationResult { valid: boolean; errors: string[]; }