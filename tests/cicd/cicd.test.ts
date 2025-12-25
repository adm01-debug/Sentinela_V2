import { CICDPipeline, Stage, Job } from '../../cicd';
describe('CICDPipeline', () => {
  let pipeline: CICDPipeline;
  beforeEach(() => { pipeline = new CICDPipeline({ name: 'test-pipeline' }); });
  it('should add stages', () => {
    pipeline.addStage({ name: 'build', jobs: [{ name: 'compile', script: 'npm run build' }] });
    pipeline.addStage({ name: 'test', jobs: [{ name: 'unit-tests', script: 'npm test' }] });
    expect(pipeline.getStages().length).toBe(2);
  });
  it('should execute pipeline', async () => {
    const executor = jest.fn().mockResolvedValue({ success: true });
    pipeline.setExecutor(executor);
    pipeline.addStage({ name: 'build', jobs: [{ name: 'compile', script: 'echo ok' }] });
    await pipeline.run();
    expect(executor).toHaveBeenCalled();
  });
  it('should stop on stage failure', async () => {
    const executor = jest.fn()
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false });
    pipeline.setExecutor(executor);
    pipeline.addStage({ name: 's1', jobs: [{ name: 'j1', script: '' }] });
    pipeline.addStage({ name: 's2', jobs: [{ name: 'j2', script: '' }] });
    pipeline.addStage({ name: 's3', jobs: [{ name: 'j3', script: '' }] });
    const result = await pipeline.run();
    expect(result.success).toBe(false);
    expect(executor).toHaveBeenCalledTimes(2);
  });
});