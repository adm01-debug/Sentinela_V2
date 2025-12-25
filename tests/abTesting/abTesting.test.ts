import { ABTestManager } from '../../abTesting';
describe('ABTestManager', () => {
  let manager: ABTestManager;
  beforeEach(() => { manager = new ABTestManager(); });
  it('should assign variants consistently', () => {
    manager.create({ id: 'exp1', name: 'Button Color', variants: ['blue', 'green'], weights: [50, 50] });
    const v1 = manager.getVariant('exp1', 'user-123');
    const v2 = manager.getVariant('exp1', 'user-123');
    expect(v1).toBe(v2);
  });
});
