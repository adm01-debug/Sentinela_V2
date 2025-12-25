import { MLPipeline, PipelineStep } from '../../mlPipeline';

describe('MLPipeline', () => {
  it('should execute pipeline steps', async () => {
    const pipeline = new MLPipeline();
    pipeline.addStep({ name: 'preprocess', execute: async (data) => ({ ...data, processed: true }) });
    pipeline.addStep({ name: 'predict', execute: async (data) => ({ ...data, prediction: 0.95 }) });
    const result = await pipeline.run({ input: 'test' });
    expect(result.processed).toBe(true);
    expect(result.prediction).toBe(0.95);
  });
});
