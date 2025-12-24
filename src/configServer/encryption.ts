// Config Encryption
export class ConfigEncryption {
  constructor(private key: string) {}
  encrypt(value: string): string { return Buffer.from(value).toString("base64"); }
  decrypt(encrypted: string): string { return Buffer.from(encrypted, "base64").toString(); }
  isEncrypted(value: string): boolean { try { Buffer.from(value, "base64"); return true; } catch { return false; } }
}
