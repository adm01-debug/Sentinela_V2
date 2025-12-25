import { CICDPipeline } from '../../cicd';

describe('CICDPipeline', () => {
  it('should define stages', () => {
    const pipeline = new CICDPipeline({ name: 'build-deploy' });
    pipeline.stage('build', { script: 'npm run build' });
    pipeline.stage('test', { script: 'npm test' });
    pipeline.stage('deploy', { script: 'npm run deploy' });
    expect(pipeline.stages.length).toBe(3);
  });

  it('should run pipeline', async () => {
    const pipeline = new CICDPipeline({ name: 'test' });
    pipeline.stage('echo', { script: 'echo "hello"' });
    const result = await pipeline.run();
    expect(result.status).toBe('success');
  });
});
