export class BcryptHash {
  private rounds = 10;
  setRounds(rounds: number) { this.rounds = rounds; }
  async hash(password: string): Promise<string> { const salt = crypto.getRandomValues(new Uint8Array(16)); const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']); const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: Math.pow(2, this.rounds), hash: 'SHA-256' }, key, 256); return btoa(String.fromCharCode(...salt)) + '.' + btoa(String.fromCharCode(...new Uint8Array(hash))); }
  async verify(password: string, hash: string): Promise<boolean> { const [saltB64, hashB64] = hash.split('.'); const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0)); const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']); const newHash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: Math.pow(2, this.rounds), hash: 'SHA-256' }, key, 256); return btoa(String.fromCharCode(...new Uint8Array(newHash))) === hashB64; }
}
export const bcryptHash = new BcryptHash();
