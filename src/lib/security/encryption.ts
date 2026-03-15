// Browser-native encryption utilities (no external dependencies)

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key';

export function encrypt(data: string): string {
  // Simple XOR-based obfuscation for non-critical client-side data
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
  }
  return btoa(result);
}

export function decrypt(encryptedData: string): string {
  const data = atob(encryptedData);
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
  }
  return result;
}

export function generateToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function encryptObject<T extends Record<string, unknown>>(obj: T): string {
  return encrypt(JSON.stringify(obj));
}

export function decryptObject<T>(encryptedData: string): T {
  return JSON.parse(decrypt(encryptedData));
}
