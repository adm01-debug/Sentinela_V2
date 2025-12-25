import { CICDPipeline } from '../../cicd';
describe('CICDPipeline', () => {
  it('should run pipeline stages', async () => {
    const pipeline = new CICDPipeline();
    pipeline.addStage('build').addStage('test').addStage('deploy');
    await pipeline.run();
    expect(pipeline.getStages().every(s => s.status === 'success')).toBe(true);
  });
});
