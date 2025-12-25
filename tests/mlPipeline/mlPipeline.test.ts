import { MLPipeline, PipelineStage, ModelTrainer } from '../../mlPipeline';

describe('MLPipeline', () => {
  let pipeline: MLPipeline;

  beforeEach(() => {
    pipeline = new MLPipeline({ name: 'test-pipeline' });
  });

  it('should add stages', () => {
    pipeline.addStage({
      name: 'preprocess',
      transform: (data) => data.map((d: number) => d * 2)
    });

    pipeline.addStage({
      name: 'normalize',
      transform: (data) => data.map((d: number) => d / 100)
    });

    expect(pipeline.getStages().length).toBe(2);
  });

  it('should execute pipeline', async () => {
    pipeline.addStage({
      name: 'double',
      transform: (data) => data.map((d: number) => d * 2)
    });

    const result = await pipeline.execute([1, 2, 3]);
    expect(result).toEqual([2, 4, 6]);
  });

  it('should track execution metrics', async () => {
    pipeline.addStage({
      name: 'slow-stage',
      transform: async (data) => {
        await new Promise(r => setTimeout(r, 10));
        return data;
      }
    });

    await pipeline.execute([1, 2, 3]);
    const metrics = pipeline.getMetrics();

    expect(metrics.executions).toBe(1);
    expect(metrics.avgDuration).toBeGreaterThan(0);
  });
});

describe('ModelTrainer', () => {
  let trainer: ModelTrainer;

  beforeEach(() => {
    trainer = new ModelTrainer({
      modelType: 'regression',
      hyperparameters: { learningRate: 0.01 }
    });
  });

  it('should train model', async () => {
    const trainingData = {
      features: [[1], [2], [3]],
      labels: [2, 4, 6]
    };

    const model = await trainer.train(trainingData);
    expect(model).toBeDefined();
    expect(model.version).toBeDefined();
  });

  it('should validate model', async () => {
    const model = await trainer.train({
      features: [[1], [2]],
      labels: [2, 4]
    });

    const validation = await trainer.validate(model, {
      features: [[3]],
      labels: [6]
    });

    expect(validation.accuracy).toBeDefined();
  });
});
