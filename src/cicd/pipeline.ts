/**
 * @fileoverview CI/CD Pipeline
 * @module @sentinela/core/cicd
 * @version 13.0.0
 */
export type StageStatus = 'pending' | 'running' | 'success' | 'failed';
export interface Stage { name: string; status: StageStatus; run: () => Promise<void>; }
export class CICDPipeline {
  private stages: Stage[] = [];
  addStage(stage: Stage): this { this.stages.push(stage); return this; }
  async run(): Promise<{ success: boolean; stages: Stage[] }> {
    for (const stage of this.stages) {
      stage.status = 'running';
      try { await stage.run(); stage.status = 'success'; }
      catch { stage.status = 'failed'; return { success: false, stages: this.stages }; }
    }
    return { success: true, stages: this.stages };
  }
}
