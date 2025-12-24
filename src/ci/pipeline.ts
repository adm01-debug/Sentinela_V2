export interface PipelineStage { name: string; jobs: string[]; dependsOn?: string[]; condition?: string; }
export class Pipeline {
  private stages: PipelineStage[] = [];
  addStage(stage: PipelineStage): void { this.stages.push(stage); }
  getStages(): PipelineStage[] { return [...this.stages]; }
  getExecutionOrder(): PipelineStage[] { const order: PipelineStage[] = []; const remaining = [...this.stages]; while (remaining.length > 0) { const next = remaining.find(s => !s.dependsOn || s.dependsOn.every(d => order.some(o => o.name === d))); if (!next) break; order.push(next); remaining.splice(remaining.indexOf(next), 1); } return order; }
}
export const createPipeline = () => new Pipeline();
