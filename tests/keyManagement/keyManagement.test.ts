import { KeyStore } from '../../keyManagement';

describe('KeyStore', () => {
  let store: KeyStore;
  beforeEach(() => { store = new KeyStore(); });

  it('should create and retrieve key', async () => {
    const keyId = await store.create({ algorithm: 'AES', size: 256 });
    const key = await store.get(keyId);
    expect(key).toBeDefined();
  });

  it('should rotate key', async () => {
    const keyId = await store.create({ algorithm: 'AES', size: 256 });
    const newKeyId = await store.rotate(keyId);
    expect(newKeyId).not.toBe(keyId);
  });

  it('should delete key', async () => {
    const keyId = await store.create({ algorithm: 'AES', size: 256 });
    await store.delete(keyId);
    await expect(store.get(keyId)).rejects.toThrow();
  });
});
