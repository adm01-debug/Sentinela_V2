/**
 * @fileoverview Key Management
 * @module @sentinela/core/keyManagement
 */
import * as crypto from 'crypto';
export interface ManagedKey { id: string; algorithm: string; createdAt: Date; expiresAt?: Date; }
export class KeyManager {
  private keys = new Map<string, { key: Buffer; meta: ManagedKey }>();
  async create(algorithm: string, expiresInDays?: number): Promise<string> {
    const id = 'key_' + crypto.randomBytes(8).toString('hex');
    const key = crypto.randomBytes(32);
    const meta: ManagedKey = { id, algorithm, createdAt: new Date(), expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : undefined };
    this.keys.set(id, { key, meta });
    return id;
  }
  async get(id: string): Promise<Buffer | undefined> { return this.keys.get(id)?.key; }
  async rotate(id: string): Promise<string> { const newId = await this.create('aes-256'); this.keys.delete(id); return newId; }
  async revoke(id: string): Promise<void> { this.keys.delete(id); }
}
