import { CICDPipeline, Stage, PipelineRun } from '../../cicd';
describe('CICDPipeline', () => {
  let pipeline: CICDPipeline;
  beforeEach(() => { pipeline = new CICDPipeline({ name: 'test-pipeline' }); });
  it('should add stages', () => {
    pipeline.addStage({ name: 'build', script: 'npm run build' });
    pipeline.addStage({ name: 'test', script: 'npm test' });
    expect(pipeline.getStages().length).toBe(2);
  });
  it('should run pipeline', async () => {
    pipeline.addStage({ name: 'echo', script: 'echo "hello"', run: async () => ({ success: true }) });
    const run = await pipeline.execute();
    expect(run.status).toBe('success');
  });
  it('should stop on failure', async () => {
    pipeline.addStage({ name: 'pass', run: async () => ({ success: true }) });
    pipeline.addStage({ name: 'fail', run: async () => ({ success: false, error: 'Failed' }) });
    pipeline.addStage({ name: 'skip', run: async () => ({ success: true }) });
    const run = await pipeline.execute();
    expect(run.status).toBe('failed');
    expect(run.stagesRun).toBe(2);
  });
});