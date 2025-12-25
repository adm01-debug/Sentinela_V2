import { SecretManager, Vault, SecretRotation } from '../../secretManagement';
describe('SecretManager', () => {
  let manager: SecretManager;
  beforeEach(() => { manager = new SecretManager(); });
  it('should store secret', async () => {
    await manager.set('db-password', 'secret123');
    const value = await manager.get('db-password');
    expect(value).toBe('secret123');
  });
  it('should list secrets', async () => {
    await manager.set('key1', 'val1');
    await manager.set('key2', 'val2');
    const keys = await manager.list();
    expect(keys).toContain('key1');
  });
  it('should delete secret', async () => {
    await manager.set('temp', 'value');
    await manager.delete('temp');
    const value = await manager.get('temp');
    expect(value).toBeNull();
  });
  it('should rotate secret', async () => {
    await manager.set('rotating', 'old');
    await manager.rotate('rotating', 'new');
    const value = await manager.get('rotating');
    expect(value).toBe('new');
  });
});