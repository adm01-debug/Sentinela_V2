import { SecretVault } from '../../secretManagement';

describe('SecretVault', () => {
  let vault: SecretVault;
  beforeEach(() => { vault = new SecretVault(); });

  it('should store and retrieve secrets', async () => {
    await vault.set('api-key', 'secret-value');
    const value = await vault.get('api-key');
    expect(value).toBe('secret-value');
  });
});
