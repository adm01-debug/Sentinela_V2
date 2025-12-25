/**
 * Integration test for security patterns
 */
import { Encryptor } from '../../src/encryptionAtRest';
import { Tokenizer } from '../../src/tokenization';
import { DLPScanner } from '../../src/dlp';
describe('Security Integration', () => {
  it('should encrypt and decrypt', async () => {
    const enc = new Encryptor({ algorithm: 'aes-256-gcm' });
    const encrypted = await enc.encrypt('secret');
    const decrypted = await enc.decrypt(encrypted);
    expect(decrypted).toBe('secret');
  });
  it('should tokenize and detokenize', async () => {
    const tok = new Tokenizer();
    const token = await tok.tokenize('4111111111111111');
    const original = await tok.detokenize(token);
    expect(original).toBe('4111111111111111');
  });
});
