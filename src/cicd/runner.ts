import { CIPipeline, CIStage, CIJob, Step } from './types';

export class PipelineRunner {
  async run(pipeline: CIPipeline): Promise<PipelineResult> {
    const results: StageResult[] = [];
    for (const stage of pipeline.stages) {
      const stageResult = await this.runStage(stage, pipeline.variables);
      results.push(stageResult);
      if (!stageResult.success) break;
    }
    return { pipelineId: pipeline.id, success: results.every(r => r.success), stages: results, duration: results.reduce((sum, r) => sum + r.duration, 0) };
  }
  
  private async runStage(stage: CIStage, variables: Record<string, string>): Promise<StageResult> {
    const start = Date.now();
    const jobResults: JobResult[] = [];
    for (const job of stage.jobs) {
      jobResults.push(await this.runJob(job, variables));
    }
    return { stageName: stage.name, success: jobResults.every(j => j.success), jobs: jobResults, duration: Date.now() - start };
  }
  
  private async runJob(job: CIJob, variables: Record<string, string>): Promise<JobResult> {
    const start = Date.now();
    for (const step of job.steps) {
      console.log('Running:', step.command);
      await new Promise(r => setTimeout(r, 10));
    }
    return { jobName: job.name, success: true, duration: Date.now() - start };
  }
}

export interface PipelineResult { pipelineId: string; success: boolean; stages: StageResult[]; duration: number; }
export interface StageResult { stageName: string; success: boolean; jobs: JobResult[]; duration: number; }
export interface JobResult { jobName: string; success: boolean; duration: number; }