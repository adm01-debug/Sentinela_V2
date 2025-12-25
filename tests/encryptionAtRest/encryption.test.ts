import { Encryptor, KeyManager, EncryptionAlgorithm } from '../../encryptionAtRest';

describe('Encryptor', () => {
  let encryptor: Encryptor;

  beforeEach(() => {
    encryptor = new Encryptor({
      algorithm: 'aes-256-gcm',
      keyId: 'test-key'
    });
  });

  it('should encrypt data', async () => {
    const plaintext = 'sensitive data';
    const encrypted = await encryptor.encrypt(plaintext);

    expect(encrypted).not.toBe(plaintext);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.tag).toBeDefined();
  });

  it('should decrypt data', async () => {
    const plaintext = 'sensitive data';
    const encrypted = await encryptor.encrypt(plaintext);
    const decrypted = await encryptor.decrypt(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('should use different IV for each encryption', async () => {
    const data = 'same data';
    const enc1 = await encryptor.encrypt(data);
    const enc2 = await encryptor.encrypt(data);

    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });
});

describe('KeyManager', () => {
  let keyManager: KeyManager;

  beforeEach(() => {
    keyManager = new KeyManager();
  });

  it('should generate key', async () => {
    const key = await keyManager.generateKey('new-key');
    expect(key.id).toBe('new-key');
    expect(key.material).toBeDefined();
  });

  it('should rotate key', async () => {
    await keyManager.generateKey('rotate-key');
    const rotated = await keyManager.rotateKey('rotate-key');

    expect(rotated.version).toBeGreaterThan(1);
  });

  it('should get key by id', async () => {
    await keyManager.generateKey('get-key');
    const key = await keyManager.getKey('get-key');

    expect(key).toBeDefined();
    expect(key.id).toBe('get-key');
  });
});
