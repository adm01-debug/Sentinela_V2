/**
 * @fileoverview Bloom Filter for probabilistic membership
 * @module @sentinela/core/bloom-filter
 */
export class BloomFilter {
  private bits: boolean[];
  private hashCount: number;
  constructor(size: number, hashCount: number) { this.bits = new Array(size).fill(false); this.hashCount = hashCount; }
  private hash(value: string, seed: number): number {
    let h = seed;
    for (let i = 0; i < value.length; i++) h = ((h << 5) - h + value.charCodeAt(i)) | 0;
    return Math.abs(h) % this.bits.length;
  }
  add(value: string): void { for (let i = 0; i < this.hashCount; i++) this.bits[this.hash(value, i)] = true; }
  mightContain(value: string): boolean { for (let i = 0; i < this.hashCount; i++) if (!this.bits[this.hash(value, i)]) return false; return true; }
  clear(): void { this.bits.fill(false); }
}
