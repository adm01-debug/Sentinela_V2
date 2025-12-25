import { ClusterAutoscaler, NodeGroup, ScaleDecision } from '../../clusterAutoscaler';

describe('ClusterAutoscaler', () => {
  let autoscaler: ClusterAutoscaler;

  beforeEach(() => {
    autoscaler = new ClusterAutoscaler({
      scaleUpThreshold: 0.8,
      scaleDownThreshold: 0.3,
      cooldownPeriod: 300
    });
  });

  it('should recommend scale up when utilization is high', async () => {
    const nodeGroups: NodeGroup[] = [
      {
        name: 'worker-pool',
        currentNodes: 3,
        minNodes: 1,
        maxNodes: 10,
        utilizationCPU: 0.9,
        utilizationMemory: 0.85
      }
    ];

    const decision = await autoscaler.evaluate(nodeGroups);

    expect(decision.action).toBe('scale-up');
    expect(decision.targetNodes).toBeGreaterThan(3);
  });

  it('should recommend scale down when utilization is low', async () => {
    const nodeGroups: NodeGroup[] = [
      {
        name: 'worker-pool',
        currentNodes: 5,
        minNodes: 1,
        maxNodes: 10,
        utilizationCPU: 0.2,
        utilizationMemory: 0.15
      }
    ];

    const decision = await autoscaler.evaluate(nodeGroups);

    expect(decision.action).toBe('scale-down');
    expect(decision.targetNodes).toBeLessThan(5);
  });

  it('should not go below min nodes', async () => {
    const nodeGroups: NodeGroup[] = [
      {
        name: 'critical-pool',
        currentNodes: 2,
        minNodes: 2,
        maxNodes: 5,
        utilizationCPU: 0.1,
        utilizationMemory: 0.1
      }
    ];

    const decision = await autoscaler.evaluate(nodeGroups);

    expect(decision.targetNodes).toBeGreaterThanOrEqual(2);
  });

  it('should not exceed max nodes', async () => {
    const nodeGroups: NodeGroup[] = [
      {
        name: 'limited-pool',
        currentNodes: 5,
        minNodes: 1,
        maxNodes: 5,
        utilizationCPU: 0.95,
        utilizationMemory: 0.9
      }
    ];

    const decision = await autoscaler.evaluate(nodeGroups);

    expect(decision.targetNodes).toBeLessThanOrEqual(5);
  });
});
