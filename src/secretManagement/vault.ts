import { Secret, SecretMetadata } from './types';
import { v4 as uuidv4 } from 'uuid';

export class SecretVault {
  private secrets: Map<string, Secret> = new Map();
  private versions: Map<string, Secret[]> = new Map();
  
  create(name: string, value: string): Secret {
    const secret: Secret = {
      id: uuidv4(), name, value: this.encrypt(value), version: 1,
      metadata: { createdAt: new Date(), updatedAt: new Date() }
    };
    this.secrets.set(secret.id, secret);
    this.versions.set(secret.id, [secret]);
    return secret;
  }
  
  get(id: string): Secret | undefined { return this.secrets.get(id); }
  getByName(name: string): Secret | undefined { return Array.from(this.secrets.values()).find(s => s.name === name); }
  
  update(id: string, value: string): Secret | undefined {
    const secret = this.secrets.get(id);
    if (!secret) return undefined;
    
    const updated: Secret = { ...secret, value: this.encrypt(value), version: secret.version + 1, metadata: { ...secret.metadata, updatedAt: new Date() } };
    this.secrets.set(id, updated);
    this.versions.get(id)!.push(updated);
    return updated;
  }
  
  delete(id: string): boolean { this.versions.delete(id); return this.secrets.delete(id); }
  
  getVersion(id: string, version: number): Secret | undefined {
    return this.versions.get(id)?.find(s => s.version === version);
  }
  
  private encrypt(value: string): string { return Buffer.from(value).toString('base64'); }
  decrypt(secret: Secret): string { return Buffer.from(secret.value, 'base64').toString(); }
}