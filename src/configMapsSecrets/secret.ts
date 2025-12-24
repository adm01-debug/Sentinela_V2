import { Secret, SecretType } from './types';

export class SecretManager {
  private secrets: Map<string, Secret> = new Map();
  
  create(secret: Secret): void {
    const encoded: Secret = { ...secret, data: this.encodeData(secret.data) };
    this.secrets.set(this.key(secret.namespace, secret.name), encoded);
  }
  
  update(secret: Secret): void { this.create(secret); }
  delete(namespace: string, name: string): boolean { return this.secrets.delete(this.key(namespace, name)); }
  
  get(namespace: string, name: string): Secret | undefined {
    const secret = this.secrets.get(this.key(namespace, name));
    if (!secret) return undefined;
    return { ...secret, data: this.decodeData(secret.data) };
  }
  
  list(namespace?: string): Secret[] {
    const all = Array.from(this.secrets.values());
    const filtered = namespace ? all.filter(s => s.namespace === namespace) : all;
    return filtered.map(s => ({ ...s, data: this.decodeData(s.data) }));
  }
  
  private key(namespace: string, name: string): string { return namespace + '/' + name; }
  private encodeData(data: Record<string, string>): Record<string, string> {
    const encoded: Record<string, string> = {};
    Object.entries(data).forEach(([k, v]) => { encoded[k] = Buffer.from(v).toString('base64'); });
    return encoded;
  }
  private decodeData(data: Record<string, string>): Record<string, string> {
    const decoded: Record<string, string> = {};
    Object.entries(data).forEach(([k, v]) => { decoded[k] = Buffer.from(v, 'base64').toString(); });
    return decoded;
  }
}