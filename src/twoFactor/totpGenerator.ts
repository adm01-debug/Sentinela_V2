export class TOTPGenerator {
  private digits = 6;
  private period = 30;
  async generate(secret: string): Promise<string> { const counter = Math.floor(Date.now() / 1000 / this.period); const key = await crypto.subtle.importKey('raw', this.base32Decode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']); const counterBuffer = new ArrayBuffer(8); new DataView(counterBuffer).setBigUint64(0, BigInt(counter)); const hmac = await crypto.subtle.sign('HMAC', key, counterBuffer); const hmacArray = new Uint8Array(hmac); const offset = hmacArray[hmacArray.length - 1] & 0xf; const code = ((hmacArray[offset] & 0x7f) << 24 | (hmacArray[offset + 1] & 0xff) << 16 | (hmacArray[offset + 2] & 0xff) << 8 | (hmacArray[offset + 3] & 0xff)) % Math.pow(10, this.digits); return code.toString().padStart(this.digits, '0'); }
  private base32Decode(str: string): Uint8Array { const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = ''; for (const c of str.toUpperCase()) { const val = alphabet.indexOf(c); if (val >= 0) bits += val.toString(2).padStart(5, '0'); } const bytes = []; for (let i = 0; i < bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2)); return new Uint8Array(bytes); }
}
export const totpGenerator = new TOTPGenerator();
