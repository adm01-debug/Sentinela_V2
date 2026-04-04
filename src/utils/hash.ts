// Hash utilities for Sentinela v17

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function sha512(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function md5(message: string): Promise<string> {
  // Simple MD5 implementation for non-cryptographic purposes
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
    // Simplified - in production use a proper library
    x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
  }
  function ff(a: Record<string, unknown>, b: Record<string, unknown>, c: unknown, d: unknown, x: number, s: string, t: unknown) {
    return add32(rol32(add32(add32(a, (b & c) | (~b & d)), add32(x, t)), s), b);
  }
  function add32(a: Record<string, unknown>, b: Record<string, unknown>) { return (a + b) & 0xFFFFFFFF; }
  function rol32(n: number, c: unknown) { return (n << c) | (n >>> (32 - c)); }
  
  // For actual MD5, use a library - this is a placeholder
  return sha256(message).then(h => h.substring(0, 32));
}

export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export function simpleHash(str: string): string {
  return Math.abs(hashCode(str)).toString(36);
}

export async function fileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateChecksum(data: string): string {
  let checksum = 0;
  for (let i = 0; i < data.length; i++) {
    checksum = (checksum + data.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return checksum.toString(16).padStart(8, '0');
}

export function verifyChecksum(data: string, checksum: string): boolean {
  return generateChecksum(data) === checksum;
}

export function createFingerprint(data: unknown): string {
  const sorted = JSON.stringify(data, Object.keys(data).sort());
  return simpleHash(sorted);
}

export function obfuscate(str: string): string {
  return btoa(str.split('').reverse().join(''));
}

export function deobfuscate(str: string): string {
  return atob(str).split('').reverse().join('');
}
