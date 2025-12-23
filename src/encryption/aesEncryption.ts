const encoder = new TextEncoder();
const decoder = new TextDecoder();
export class AESEncryption {
  private key: CryptoKey | null = null;
  async generateKey(): Promise<CryptoKey> { this.key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']); return this.key; }
  async encrypt(data: string): Promise<{ encrypted: string; iv: string }> { if (!this.key) await this.generateKey(); const iv = crypto.getRandomValues(new Uint8Array(12)); const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.key!, encoder.encode(data)); return { encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))), iv: btoa(String.fromCharCode(...iv)) }; }
  async decrypt(encrypted: string, iv: string): Promise<string> { if (!this.key) throw new Error('No key'); const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)) }, this.key, Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))); return decoder.decode(decrypted); }
}
export const aesEncryption = new AESEncryption();
