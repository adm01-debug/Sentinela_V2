import { PartitionManager } from '../../partitioning';
describe('PartitionManager', () => {
  let manager: PartitionManager;
  beforeEach(() => { manager = new PartitionManager(); manager.create(4); });
  it('should distribute keys to partitions', () => {
    const p1 = manager.getPartition('user-123');
    const p2 = manager.getPartition('user-456');
    expect(p1.id).toBeGreaterThanOrEqual(0);
    expect(p2.id).toBeLessThan(4);
  });
});
