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

export async function md5(message: string): Promise<string> {
  // Simple MD5 implementation for non-cryptographic purposes
  // For actual MD5, use a library - this is a placeholder
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

export function obfuscate(str): string {
  return btoa(str.split("").reverse().join(""));
}

export function deobfuscate(str): string {
  return atob(str).split("").reverse().join("");
}
