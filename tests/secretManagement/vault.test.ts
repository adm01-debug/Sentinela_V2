import { SecretVault } from '../../secretManagement';
describe('SecretVault', () => {
  let vault: SecretVault;
  beforeEach(() => { vault = new SecretVault(); });
  it('should store and retrieve secrets', async () => {
    await vault.set('db-password', 'secret123');
    expect(await vault.get('db-password')).toBe('secret123');
    await vault.delete('db-password');
    expect(await vault.get('db-password')).toBeUndefined();
  });
});
