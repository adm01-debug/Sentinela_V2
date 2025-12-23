export class RSAEncryption {
  private keyPair: CryptoKeyPair | null = null;
  async generateKeyPair(): Promise<CryptoKeyPair> { this.keyPair = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']); return this.keyPair; }
  async encrypt(data: string): Promise<string> { if (!this.keyPair) await this.generateKeyPair(); const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, this.keyPair!.publicKey, new TextEncoder().encode(data)); return btoa(String.fromCharCode(...new Uint8Array(encrypted))); }
  async decrypt(encrypted: string): Promise<string> { if (!this.keyPair) throw new Error('No key pair'); const decrypted = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, this.keyPair.privateKey, Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))); return new TextDecoder().decode(decrypted); }
}
export const rsaEncryption = new RSAEncryption();
