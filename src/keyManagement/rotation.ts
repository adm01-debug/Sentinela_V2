import { KeyManagementService } from './kms';
import { ManagedKey } from './types';

export class KeyRotationService {
  constructor(private kms: KeyManagementService) {}
  
  async rotate(keyId: string, createdBy: string): Promise<ManagedKey> {
    const oldKey = await this.kms.getKey(keyId);
    if (!oldKey) throw new Error('Key not found');
    
    const newKey = await this.kms.createKey(oldKey.alias + '_rotated', oldKey.type, oldKey.algorithm, createdBy);
    newKey.metadata.tags['previousKeyId'] = keyId;
    
    await this.kms.disableKey(keyId);
    
    return newKey;
  }
  
  async scheduleRotation(keyId: string, intervalDays: number): Promise<RotationSchedule> {
    const key = await this.kms.getKey(keyId);
    if (!key) throw new Error('Key not found');
    
    return {
      keyId,
      intervalDays,
      nextRotation: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000),
      enabled: true
    };
  }
  
  async getKeysNeedingRotation(maxAgeDays: number): Promise<ManagedKey[]> {
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    const allKeys = Array.from((await this.getAllKeys()).values());
    return allKeys.filter(k => k.state === 'enabled' && k.metadata.createdAt.getTime() < cutoff);
  }
  
  private async getAllKeys(): Promise<Map<string, ManagedKey>> {
    return new Map();
  }
}

export interface RotationSchedule { keyId: string; intervalDays: number; nextRotation: Date; enabled: boolean; }