export interface StepContext { input: any; output?: any; variables: Record<string, any>; }
export type StepType = 'action' | 'condition' | 'parallel' | 'loop' | 'delay';
export interface ExecutableStep { id: string; type: StepType; config: any; execute: (context: StepContext) => Promise<any>; }
export class StepExecutor {
  async execute(step: ExecutableStep, context: StepContext): Promise<any> { switch (step.type) { case 'action': return step.execute(context); case 'delay': await new Promise(r => setTimeout(r, step.config.ms || 1000)); return null; case 'condition': return step.config.condition(context) ? step.config.then : step.config.else; default: return step.execute(context); } }
  async executeParallel(steps: ExecutableStep[], context: StepContext): Promise<any[]> { return Promise.all(steps.map(s => this.execute(s, context))); }
  async executeSequence(steps: ExecutableStep[], context: StepContext): Promise<any[]> { const results: any[] = []; for (const step of steps) { results.push(await this.execute(step, context)); } return results; }
}
export const stepExecutor = new StepExecutor();
