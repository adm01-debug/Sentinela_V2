import { ABExperiment } from '../../abTesting';

describe('ABExperiment', () => {
  let experiment: ABExperiment;
  beforeEach(() => {
    experiment = new ABExperiment({
      name: 'button-color',
      variants: [{ name: 'control', weight: 50 }, { name: 'treatment', weight: 50 }]
    });
  });

  it('should assign variant consistently', () => {
    const v1 = experiment.getVariant('user-123');
    const v2 = experiment.getVariant('user-123');
    expect(v1).toBe(v2);
  });

  it('should track conversions', async () => {
    const variant = experiment.getVariant('user-123');
    await experiment.trackConversion('user-123');
    const stats = await experiment.getStats();
    expect(stats[variant].conversions).toBe(1);
  });
});
