export async function sha256(data: string): Promise<string> { const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)); return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''); }
export async function sha256WithSalt(data: string, salt: string): Promise<string> { return sha256(salt + data); }
export function generateSalt(length = 16): string { return Array.from(crypto.getRandomValues(new Uint8Array(length))).map(b => b.toString(16).padStart(2, '0')).join(''); }
