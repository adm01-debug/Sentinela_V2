export class KeyValueStore {
  private data: Map<string, { value: unknown; expiresAt?: number }> = new Map();
  
  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    this.data.set(key, { value, expiresAt: ttlMs ? Date.now() + ttlMs : undefined });
  }
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.data.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) { this.data.delete(key); return null; }
    return entry.value as T;
  }
  
  async delete(key: string): Promise<boolean> { return this.data.delete(key); }
  async exists(key: string): Promise<boolean> { return (await this.get(key)) !== null; }
  
  async increment(key: string, by: number = 1): Promise<number> {
    const current = await this.get<number>(key) ?? 0;
    const newValue = current + by;
    await this.set(key, newValue);
    return newValue;
  }
  
  async setMany(entries: Array<{ key: string; value: unknown; ttlMs?: number }>): Promise<void> {
    for (const entry of entries) await this.set(entry.key, entry.value, entry.ttlMs);
  }
  
  async getMany<T>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();
    for (const key of keys) result.set(key, await this.get<T>(key));
    return result;
  }
  
  async keys(pattern?: string): Promise<string[]> {
    let keys = Array.from(this.data.keys());
    if (pattern) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      keys = keys.filter(k => regex.test(k));
    }
    return keys;
  }
}