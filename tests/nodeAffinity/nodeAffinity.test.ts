import { NodeAffinityManager, Affinity, NodeSelectorTerm } from '../../nodeAffinity';
describe('NodeAffinityManager', () => {
  let manager: NodeAffinityManager;
  beforeEach(() => { manager = new NodeAffinityManager(); });
  it('should create required affinity', () => {
    const affinity = manager.required([
      { key: 'zone', operator: 'In', values: ['us-east-1a'] }
    ]);
    expect(affinity.requiredDuringSchedulingIgnoredDuringExecution).toBeDefined();
  });
  it('should create preferred affinity', () => {
    const affinity = manager.preferred([
      { weight: 100, preference: { key: 'gpu', operator: 'Exists' } }
    ]);
    expect(affinity.preferredDuringSchedulingIgnoredDuringExecution).toBeDefined();
  });
  it('should combine affinities', () => {
    const combined = manager.combine([
      manager.required([{ key: 'zone', operator: 'In', values: ['us-east-1a'] }]),
      manager.preferred([{ weight: 50, preference: { key: 'ssd', operator: 'Exists' } }])
    ]);
    expect(combined.requiredDuringSchedulingIgnoredDuringExecution).toBeDefined();
    expect(combined.preferredDuringSchedulingIgnoredDuringExecution).toBeDefined();
  });
});