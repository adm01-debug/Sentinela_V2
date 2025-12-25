/**
 * Security patterns example
 */
import { Encryptor } from '../src/encryptionAtRest';
import { Tokenizer } from '../src/tokenization';
import { DLPScanner } from '../src/dlp';
import { RoleManager, Authorizer } from '../src/rbac';
const encryptor = new Encryptor({ algorithm: 'aes-256-gcm' });
const tokenizer = new Tokenizer();
const dlp = new DLPScanner();
const roles = new RoleManager();
const auth = new Authorizer(roles);
async function secureData(data: string, userId: string) {
  if (!await auth.can(userId, 'write')) throw new Error('Unauthorized');
  const scan = await dlp.scan(data);
  if (scan.findings.length > 0) data = await dlp.redact(data);
  return encryptor.encrypt(data);
}
