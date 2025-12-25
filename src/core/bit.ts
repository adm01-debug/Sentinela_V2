/**
 * @fileoverview Bit manipulation utilities
 * @module @sentinela/core/bit
 */
export function getBit(n: number, pos: number): number { return (n >> pos) & 1; }
export function setBit(n: number, pos: number): number { return n | (1 << pos); }
export function clearBit(n: number, pos: number): number { return n & ~(1 << pos); }
export function toggleBit(n: number, pos: number): number { return n ^ (1 << pos); }
export function countBits(n: number): number { let count = 0; while (n) { count += n & 1; n >>>= 1; } return count; }
export function isPowerOfTwo(n: number): boolean { return n > 0 && (n & (n - 1)) === 0; }
export function nextPowerOfTwo(n: number): number { if (n <= 0) return 1; n--; n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16; return n + 1; }
