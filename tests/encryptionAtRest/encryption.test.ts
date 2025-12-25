import { Encryptor } from '../../encryptionAtRest';
describe('Encryptor', () => {
  it('should encrypt and decrypt with GCM', async () => {
    const encryptor = new Encryptor({ algorithm: 'aes-256-gcm' });
    const encrypted = await encryptor.encrypt('secret message');
    const decrypted = await encryptor.decrypt(encrypted);
    expect(decrypted).toBe('secret message');
  });
  it('should encrypt and decrypt with CBC', async () => {
    const encryptor = new Encryptor({ algorithm: 'aes-256-cbc' });
    const encrypted = await encryptor.encrypt('another secret');
    const decrypted = await encryptor.decrypt(encrypted);
    expect(decrypted).toBe('another secret');
  });
});
