import { ServiceAccountManager } from '../../serviceAccounts';

describe('ServiceAccountManager', () => {
  let manager: ServiceAccountManager;
  beforeEach(() => { manager = new ServiceAccountManager(); });

  it('should create service account', async () => {
    const sa = await manager.create({ name: 'app-sa', namespace: 'default' });
    expect(sa.token).toBeDefined();
  });

  it('should rotate token', async () => {
    const sa = await manager.create({ name: 'app-sa', namespace: 'default' });
    const newToken = await manager.rotateToken(sa.name);
    expect(newToken).not.toBe(sa.token);
  });
});
