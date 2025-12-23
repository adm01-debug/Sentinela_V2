import { bcryptHash } from './bcryptHash';
import { sha256 } from './sha256Hash';
import { md5 } from './md5Hash';
export type HashAlgorithm = 'bcrypt' | 'sha256' | 'md5';
export const hashService = {
  async hash(data: string, algorithm: HashAlgorithm = 'sha256'): Promise<string> { switch (algorithm) { case 'bcrypt': return bcryptHash.hash(data); case 'sha256': return sha256(data); case 'md5': return md5(data); } },
  async verify(data: string, hash: string, algorithm: HashAlgorithm = 'bcrypt'): Promise<boolean> { if (algorithm === 'bcrypt') return bcryptHash.verify(data, hash); const newHash = await this.hash(data, algorithm); return newHash === hash; },
};
