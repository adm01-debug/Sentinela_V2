import { CIStage, CIJob, Step } from './types';

export class StageFactory {
  static build(name: string, jobs: CIJob[]): CIStage { return { name, jobs }; }
  static test(runner: string = 'ubuntu-latest'): CIStage {
    return { name: 'test', jobs: [{ name: 'unit-tests', steps: [{ name: 'Run tests', command: 'npm test' }], runner }] };
  }
  static lint(runner: string = 'ubuntu-latest'): CIStage {
    return { name: 'lint', jobs: [{ name: 'linting', steps: [{ name: 'Lint', command: 'npm run lint' }], runner }] };
  }
  static deploy(env: string, runner: string = 'ubuntu-latest'): CIStage {
    return { name: 'deploy-' + env, jobs: [{ name: 'deploy', steps: [{ name: 'Deploy', command: 'npm run deploy:' + env }], runner }] };
  }
}

export class JobBuilder {
  private job: Partial<CIJob> = { steps: [] };
  
  name(name: string): this { this.job.name = name; return this; }
  runner(runner: string): this { this.job.runner = runner; return this; }
  step(name: string, command: string, timeout?: number): this { this.job.steps!.push({ name, command, timeout }); return this; }
  
  build(): CIJob { return this.job as CIJob; }
}