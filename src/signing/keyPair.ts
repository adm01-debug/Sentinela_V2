export class KeyPairManager {
  async generate(): Promise<CryptoKeyPair> { return crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']); }
  async exportPublicKey(keyPair: CryptoKeyPair): Promise<string> { const exported = await crypto.subtle.exportKey('spki', keyPair.publicKey); return btoa(String.fromCharCode(...new Uint8Array(exported))); }
  async importPublicKey(keyData: string): Promise<CryptoKey> { const raw = Uint8Array.from(atob(keyData), c => c.charCodeAt(0)); return crypto.subtle.importKey('spki', raw, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['verify']); }
}
export const keyPairManager = new KeyPairManager();
