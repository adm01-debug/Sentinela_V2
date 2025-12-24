export class SignatureVerifier {
  async verifyHMAC(data: string, signature: string, secret: string): Promise<boolean> { const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); const expected = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)); return signature === btoa(String.fromCharCode(...new Uint8Array(expected))); }
  async verifyRSA(data: string, signature: string, publicKey: CryptoKey): Promise<boolean> { const sig = Uint8Array.from(atob(signature), c => c.charCodeAt(0)); return crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, publicKey, sig, new TextEncoder().encode(data)); }
}
export const signatureVerifier = new SignatureVerifier();
