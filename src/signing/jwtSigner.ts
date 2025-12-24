export class JwtSigner {
  private secret: string = '';
  setSecret(secret: string): void { this.secret = secret; }
  async sign(payload: object, expiresIn = 3600): Promise<string> { const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })); const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + expiresIn * 1000, iat: Date.now() })); const signature = await this.createSignature(header + '.' + body); return header + '.' + body + '.' + signature; }
  async verify(token: string): Promise<object | null> { const [header, body, signature] = token.split('.'); const expectedSig = await this.createSignature(header + '.' + body); if (signature !== expectedSig) return null; const payload = JSON.parse(atob(body)); if (payload.exp && payload.exp < Date.now()) return null; return payload; }
  private async createSignature(data: string): Promise<string> { const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(this.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)); return btoa(String.fromCharCode(...new Uint8Array(sig))); }
}
export const jwtSigner = new JwtSigner();
