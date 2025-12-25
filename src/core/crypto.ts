/**
 * @fileoverview Cryptographic utilities
 * @module @sentinela/core/crypto
 */
import * as crypto from 'crypto';
export function hash(data: string, algorithm: string = 'sha256'): string { return crypto.createHash(algorithm).update(data).digest('hex'); }
export function hmac(data: string, key: string, algorithm: string = 'sha256'): string { return crypto.createHmac(algorithm, key).update(data).digest('hex'); }
export function randomString(length: number): string { return crypto.randomBytes(length).toString('hex').slice(0, length); }
export function randomInt(min: number, max: number): number { return crypto.randomInt(min, max); }
export function secureCompare(a: string, b: string): boolean { return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)); }
