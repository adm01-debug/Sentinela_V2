import { SecretManager, Vault, SecretRotation } from '../../secretManagement';
describe('SecretManager', () => {
  let manager: SecretManager;
  beforeEach(() => { manager = new SecretManager(); });
  it('should store and retrieve secret', async () => {
    await manager.set('api-key', 'secret123');
    const value = await manager.get('api-key');
    expect(value).toBe('secret123');
  });
  it('should delete secret', async () => {
    await manager.set('temp-key', 'temp');
    await manager.delete('temp-key');
    const value = await manager.get('temp-key');
    expect(value).toBeNull();
  });
  it('should rotate secret', async () => {
    await manager.set('rotating-key', 'old-value');
    await manager.rotate('rotating-key', 'new-value');
    const value = await manager.get('rotating-key');
    expect(value).toBe('new-value');
  });
  it('should list secrets', async () => {
    await manager.set('key1', 'v1');
    await manager.set('key2', 'v2');
    const keys = await manager.list();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
  });
});