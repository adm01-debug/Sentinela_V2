import { ABTestManager, Experiment, Variant } from '../../abTesting';
describe('ABTestManager', () => {
  let manager: ABTestManager;
  beforeEach(() => { manager = new ABTestManager(); });
  it('should create experiment', () => {
    const exp = manager.createExperiment({
      name: 'button-color',
      variants: [
        { id: 'control', weight: 50 },
        { id: 'blue', weight: 50 }
      ]
    });
    expect(exp.id).toBeDefined();
  });
  it('should assign user to variant', () => {
    manager.createExperiment({
      name: 'test',
      variants: [{ id: 'a', weight: 50 }, { id: 'b', weight: 50 }]
    });
    const variant = manager.getVariant('test', 'user-123');
    expect(['a', 'b']).toContain(variant);
  });
  it('should track conversion', () => {
    manager.createExperiment({
      name: 'conv-test',
      variants: [{ id: 'a', weight: 100 }]
    });
    manager.trackConversion('conv-test', 'user-1', 'a');
    const stats = manager.getStats('conv-test');
    expect(stats.conversions).toBe(1);
  });
});