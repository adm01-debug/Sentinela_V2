import { useCallback } from 'react';
import { encrypt, decrypt } from '@/lib/security/encryption';

export function useEncryption() {
  const encryptData = useCallback((data: string) => encrypt(data), []);
  const decryptData = useCallback((data: string) => decrypt(data), []);
  
  return { encrypt: encryptData, decrypt: decryptData };
}
