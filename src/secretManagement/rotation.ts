import { SecretVault } from './vault';
import { Secret, RotationPolicy } from './types';

export class SecretRotator {
  constructor(private vault: SecretVault) {}
  
  async rotate(secretId: string, generator: () => string): Promise<Secret | undefined> {
    const newValue = generator();
    return this.vault.update(secretId, newValue);
  }
  
  getSecretsNeedingRotation(): Secret[] {
    const now = Date.now();
    const secrets: Secret[] = [];
    // Would iterate through vault and check rotation policies
    return secrets;
  }
  
  setRotationPolicy(secretId: string, policy: RotationPolicy): void {
    const secret = this.vault.get(secretId);
    if (secret) secret.metadata.rotationPolicy = policy;
  }
}

export class SecretGenerator {
  static password(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  static apiKey(): string { return 'sk_' + Array.from({ length: 32 }, () => Math.random().toString(36).charAt(2)).join(''); }
  static uuid(): string { return uuidv4(); }
}

import { v4 as uuidv4 } from 'uuid';