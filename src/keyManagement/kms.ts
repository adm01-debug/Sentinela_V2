import { ManagedKey, KeyState, KeyPolicy } from './types';
import { v4 as uuidv4 } from 'uuid';

export class KeyManagementService {
  private keys: Map<string, ManagedKey> = new Map();
  private policies: Map<string, KeyPolicy[]> = new Map();
  
  async createKey(alias: string, type: ManagedKey['type'], algorithm: string, createdBy: string): Promise<ManagedKey> {
    const key: ManagedKey = {
      id: uuidv4(), alias, type, algorithm, state: 'enabled',
      metadata: { createdAt: new Date(), createdBy, tags: {} }
    };
    this.keys.set(key.id, key);
    return key;
  }
  
  async getKey(id: string): Promise<ManagedKey | undefined> { return this.keys.get(id); }
  async getKeyByAlias(alias: string): Promise<ManagedKey | undefined> {
    return Array.from(this.keys.values()).find(k => k.alias === alias);
  }
  
  async enableKey(id: string): Promise<void> { const key = this.keys.get(id); if (key) key.state = 'enabled'; }
  async disableKey(id: string): Promise<void> { const key = this.keys.get(id); if (key) key.state = 'disabled'; }
  
  async scheduleKeyDeletion(id: string, days: number = 30): Promise<Date> {
    const key = this.keys.get(id);
    if (!key) throw new Error('Key not found');
    key.state = 'pending_deletion';
    const deletionDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    key.metadata.expiresAt = deletionDate;
    return deletionDate;
  }
  
  async attachPolicy(policy: KeyPolicy): Promise<void> {
    const existing = this.policies.get(policy.keyId) ?? [];
    existing.push(policy);
    this.policies.set(policy.keyId, existing);
  }
  
  async checkPermission(keyId: string, principal: string, action: string): Promise<boolean> {
    const policies = this.policies.get(keyId) ?? [];
    return policies.some(p => p.principals.includes(principal) && p.actions.includes(action));
  }
}