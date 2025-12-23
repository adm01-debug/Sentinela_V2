export class KeyManager {
  private keys = new Map<string, CryptoKey>();
  async store(name: string, key: CryptoKey): Promise<void> { this.keys.set(name, key); }
  async retrieve(name: string): Promise<CryptoKey | undefined> { return this.keys.get(name); }
  async delete(name: string): Promise<boolean> { return this.keys.delete(name); }
  async rotate(name: string, newKey: CryptoKey): Promise<void> { this.keys.set(name, newKey); }
  list(): string[] { return Array.from(this.keys.keys()); }
  clear(): void { this.keys.clear(); }
}
export const keyManager = new KeyManager();
