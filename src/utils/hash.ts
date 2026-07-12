// Hash utilities for Sentinela v17

export async function sha256(message): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha512(message): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-512", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// NOTE: this is NOT MD5 — it returns the first 32 hex chars of a SHA-256 digest.
// Do not compare output against true MD5 values. Use sha256() for integrity checks.
export async function md5(message: string): Promise<string> {
  return sha256(message).then((h) => h.substring(0, 32));
}

export function hashCode(str): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

export function simpleHash(str): string {
  return Math.abs(hashCode(str)).toString(36);
}

export async function fileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateChecksum(data): string {
  let checksum = 0;
  for (let i = 0; i < data.length; i++) {
    checksum = (checksum + data.charCodeAt(i)) & 0xffffffff;
  }
  return checksum.toString(16).padStart(8, "0");
}

export function verifyChecksum(data: string, checksum: string): boolean {
  return generateChecksum(data) === checksum;
}

export function createFingerprint(data): string {
  const sorted = JSON.stringify(data, Object.keys(data).sort());
  return simpleHash(sorted);
}

export function obfuscate(str: string): string {
  const reversed = str.split("").reverse().join("");
  const bytes = new TextEncoder().encode(reversed);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

export function deobfuscate(str: string): string {
  const binary = atob(str);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes).split("").reverse().join("");
}
