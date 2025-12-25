import { Replicator } from '../../replication';
describe('Replicator', () => {
  it('should replicate data', async () => {
    const replicator = new Replicator({ primary: 'db1', replicas: ['db2', 'db3'], mode: 'async' });
    const result = await replicator.replicate({ id: 1, data: 'test' });
    expect(result.success).toBe(true);
    expect(result.replicated).toBe(2);
  });
});
