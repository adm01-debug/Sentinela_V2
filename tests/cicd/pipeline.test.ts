import { PipelineBuilder, PipelineRunner } from '../../src/cicd';

describe('PipelineBuilder', () => {
  it('should build pipeline with stages', () => {
    const builder = new PipelineBuilder();
    
    const pipeline = builder
      .name('build-and-deploy')
      .stage('test')
        .job('unit-tests')
          .step('npm test')
        .endJob()
      .endStage()
      .stage('build')
        .job('docker-build')
          .step('docker build -t app:latest .')
        .endJob()
      .endStage()
      .build();

    expect(pipeline.name).toBe('build-and-deploy');
    expect(pipeline.stages.length).toBe(2);
  });

  it('should support parallel jobs', () => {
    const builder = new PipelineBuilder();
    
    const pipeline = builder
      .name('parallel-tests')
      .stage('test')
        .job('unit').step('npm run test:unit').endJob()
        .job('integration').step('npm run test:integration').endJob()
        .job('e2e').step('npm run test:e2e').endJob()
      .endStage()
      .build();

    expect(pipeline.stages[0].jobs.length).toBe(3);
  });
});

describe('PipelineRunner', () => {
  it('should run pipeline', async () => {
    const runner = new PipelineRunner();
    
    const result = await runner.run({
      name: 'simple',
      stages: [{
        name: 'test',
        jobs: [{
          name: 'echo',
          steps: [{ command: 'echo hello' }]
        }]
      }]
    });

    expect(result.status).toBeDefined();
  });
});
