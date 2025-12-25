/**
 * @fileoverview ML Pipeline
 * @module @sentinela/core/mlPipeline
 */
export interface PipelineStep { name: string; transform: (data: unknown) => Promise<unknown>; }
export class MLPipeline {
  private steps: PipelineStep[] = [];
  add(step: PipelineStep): this { this.steps.push(step); return this; }
  async execute(input: unknown): Promise<unknown> {
    let result = input;
    for (const step of this.steps) result = await step.transform(result);
    return result;
  }
}
