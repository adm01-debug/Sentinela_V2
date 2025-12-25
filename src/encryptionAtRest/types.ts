export interface EncryptorConfig { algorithm: 'aes-256-gcm' | 'aes-256-cbc'; keyId?: string; }
export interface EncryptedData { ciphertext: string; iv: string; tag?: string; algorithm: string; keyId?: string; }
