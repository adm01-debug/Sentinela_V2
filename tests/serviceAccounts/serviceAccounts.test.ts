import { ServiceAccountManager } from '../../serviceAccounts';
describe('ServiceAccountManager', () => {
  let manager: ServiceAccountManager;
  beforeEach(() => { manager = new ServiceAccountManager(); });
  it('should manage service accounts', async () => {
    await manager.create({ name: 'api-sa', namespace: 'default' });
    await manager.addSecret('default', 'api-sa', 'api-token');
    const sa = await manager.get('default', 'api-sa');
    expect(sa?.secrets).toContain('api-token');
  });
});
