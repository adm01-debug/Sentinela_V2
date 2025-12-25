import { Encryptor } from '../../encryptionAtRest';

describe('Encryptor', () => {
  let encryptor: Encryptor;
  beforeEach(() => { encryptor = new Encryptor({ algorithm: 'aes-256-gcm' }); });

  it('should encrypt and decrypt data', async () => {
    const plaintext = 'sensitive data';
    const encrypted = await encryptor.encrypt(plaintext);
    const decrypted = await encryptor.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertext each time', async () => {
    const e1 = await encryptor.encrypt('test');
    const e2 = await encryptor.encrypt('test');
    expect(e1).not.toBe(e2);
  });
});
