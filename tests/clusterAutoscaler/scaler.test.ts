import { ClusterAutoscaler } from '../../clusterAutoscaler';
describe('ClusterAutoscaler', () => {
  it('should evaluate scaling', async () => {
    const scaler = new ClusterAutoscaler({ minNodes: 3, maxNodes: 10 });
    scaler.updateMetrics({ pendingPods: 50, utilizationPct: 85 });
    const decision = await scaler.evaluate();
    expect(decision.action).toBe('scale-up');
  });
});
