import { Feature, featureExtractor } from './featureExtractor';
import { predictor, Prediction } from './predictor';
import { MLModel } from './modelLoader';
export interface PipelineStep { name: string; fn: (data: any) => any; }
export class MLPipeline {
  private steps: PipelineStep[] = [];
  addStep(name: string, fn: (data: any) => any): this { this.steps.push({ name, fn }); return this; }
  async run(input: any): Promise<any> { let data = input; for (const step of this.steps) { data = await step.fn(data); } return data; }
  getSteps(): string[] { return this.steps.map(s => s.name); }
  clear(): void { this.steps = []; }
}
export const createPipeline = () => new MLPipeline();
