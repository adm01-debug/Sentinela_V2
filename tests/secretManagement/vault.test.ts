import { SecretVault, SecretRotator } from '../../src/secretManagement';

describe('SecretVault', () => {
  let vault: SecretVault;

  beforeEach(() => {
    vault = new SecretVault();
  });

  it('should store and retrieve secrets', async () => {
    await vault.set('api-key', 'secret-value');
    const value = await vault.get('api-key');
    
    expect(value).toBe('secret-value');
  });

  it('should version secrets', async () => {
    await vault.set('password', 'v1');
    await vault.set('password', 'v2');
    
    const current = await vault.get('password');
    expect(current).toBe('v2');

    const v1 = await vault.getVersion('password', 1);
    expect(v1).toBe('v1');
  });

  it('should delete secrets', async () => {
    await vault.set('temp', 'value');
    await vault.delete('temp');
    
    const value = await vault.get('temp');
    expect(value).toBeUndefined();
  });

  it('should list secret keys', async () => {
    await vault.set('key1', 'val1');
    await vault.set('key2', 'val2');
    
    const keys = await vault.list();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
  });
});

describe('SecretRotator', () => {
  it('should generate new secrets', () => {
    const rotator = new SecretRotator();
    
    const password = rotator.generatePassword(16);
    expect(password.length).toBe(16);

    const apiKey = rotator.generateApiKey();
    expect(apiKey.length).toBeGreaterThan(20);
  });
});
