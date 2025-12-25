import { ABTestManager, Experiment, Variant } from '../../abTesting';
describe('ABTestManager', () => {
  let manager: ABTestManager;
  beforeEach(() => { manager = new ABTestManager(); });
  it('should create experiment', async () => {
    const exp = await manager.createExperiment({
      name: 'button-color',
      variants: [{ name: 'control', weight: 50 }, { name: 'treatment', weight: 50 }]
    });
    expect(exp.id).toBeDefined();
  });
  it('should assign user to variant', async () => {
    await manager.createExperiment({
      name: 'test-exp',
      variants: [{ name: 'A', weight: 50 }, { name: 'B', weight: 50 }]
    });
    const variant = await manager.getVariant('test-exp', 'user-123');
    expect(['A', 'B']).toContain(variant);
  });
  it('should track conversion', async () => {
    await manager.createExperiment({
      name: 'conv-test',
      variants: [{ name: 'A', weight: 100 }]
    });
    await manager.trackConversion('conv-test', 'user-1', 'A');
    const stats = await manager.getStats('conv-test');
    expect(stats.conversions).toBeGreaterThan(0);
  });
});