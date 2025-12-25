/**
 * @fileoverview Encryption at rest types
 * @module @sentinela/core/encryptionAtRest
 * @version 13.0.0
 */

export interface EncryptionKey { id: string; algorithm: string; key: string; createdAt: Date; expiresAt?: Date; status: 'active' | 'rotated' | 'expired'; }
export interface EncryptedData { ciphertext: string; keyId: string; iv: string; algorithm: string; }
export interface EncryptionConfig { algorithm: 'aes-256-gcm' | 'aes-256-cbc'; keyRotationDays: number; }