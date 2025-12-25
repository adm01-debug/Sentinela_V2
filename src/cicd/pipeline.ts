/**
 * @fileoverview CI/CD Pipeline
 * @module @sentinela/core/cicd
 */
export type StageStatus = 'pending' | 'running' | 'success' | 'failed';
export interface Stage { name: string; status: StageStatus; }
export class CICDPipeline {
  private stages: Stage[] = [];
  addStage(name: string): this { this.stages.push({ name, status: 'pending' }); return this; }
  async run(): Promise<void> {
    for (const stage of this.stages) {
      stage.status = 'running';
      stage.status = 'success';
    }
  }
  getStages(): Stage[] { return this.stages; }
}
