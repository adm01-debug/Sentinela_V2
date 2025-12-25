/**
 * @fileoverview ML Pipeline
 * @module @sentinela/core/mlPipeline
 * @version 13.0.0
 */
export interface PipelineStep { name: string; transform: (data: any) => Promise<any>; }
export class MLPipeline {
  private steps: PipelineStep[] = [];
  add(step: PipelineStep): this { this.steps.push(step); return this; }
  async run(input: any): Promise<any> {
    let data = input;
    for (const step of this.steps) data = await step.transform(data);
    return data;
  }
}
