import { PartitionManager } from '../../partitioning';

describe('PartitionManager', () => {
  let manager: PartitionManager;
  beforeEach(() => { manager = new PartitionManager({ strategy: 'range' }); });

  it('should determine partition', () => {
    const partition = manager.getPartition('2024-01-15');
    expect(partition).toBeDefined();
  });
});
