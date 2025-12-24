import { Pipeline, PipelineStage } from './types';

export class PipelineExecutor {
  async execute(pipeline: Pipeline): Promise<ExecutionResult> {
    const results: StageResult[] = [];
    const startTime = Date.now();
    
    for (const stage of pipeline.stages) {
      const stageResult = await this.executeStage(stage);
      results.push(stageResult);
      if (!stageResult.success) break;
    }
    
    return {
      pipelineId: pipeline.id,
      success: results.every(r => r.success),
      stages: results,
      duration: Date.now() - startTime
    };
  }
  
  private async executeStage(stage: PipelineStage): Promise<StageResult> {
    const start = Date.now();
    try {
      await new Promise(r => setTimeout(r, 50));
      return { stageId: stage.id, success: true, duration: Date.now() - start };
    } catch (e) {
      return { stageId: stage.id, success: false, error: (e as Error).message, duration: Date.now() - start };
    }
  }
}

export interface ExecutionResult { pipelineId: string; success: boolean; stages: StageResult[]; duration: number; }
export interface StageResult { stageId: string; success: boolean; error?: string; duration: number; }