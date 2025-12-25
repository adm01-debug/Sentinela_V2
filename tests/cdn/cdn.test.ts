import { CDNManager, CDNConfig, CachePolicy } from '../../cdn';
describe('CDNManager', () => {
  let manager: CDNManager;
  beforeEach(() => { manager = new CDNManager({ provider: 'cloudflare' }); });
  it('should purge cache', async () => {
    const result = await manager.purge(['https://example.com/page1']);
    expect(result.success).toBe(true);
  });
  it('should purge all cache', async () => {
    const result = await manager.purgeAll();
    expect(result.success).toBe(true);
  });
  it('should set cache policy', async () => {
    await manager.setCachePolicy({
      path: '/api/*',
      ttl: 3600,
      staleWhileRevalidate: 86400
    });
    const policy = await manager.getCachePolicy('/api/*');
    expect(policy.ttl).toBe(3600);
  });
  it('should get cache stats', async () => {
    const stats = await manager.getStats();
    expect(stats.hitRatio).toBeDefined();
  });
});