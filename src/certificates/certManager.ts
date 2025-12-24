export interface Certificate { id: string; domain: string; issuer: string; validFrom: Date; validTo: Date; fingerprint: string; }
export class CertManager {
  private certs = new Map<string, Certificate>();
  add(cert: Certificate): void { this.certs.set(cert.id, cert); }
  get(id: string): Certificate | undefined { return this.certs.get(id); }
  getByDomain(domain: string): Certificate | undefined { return Array.from(this.certs.values()).find(c => c.domain === domain); }
  remove(id: string): boolean { return this.certs.delete(id); }
  list(): Certificate[] { return Array.from(this.certs.values()); }
  getExpiring(days = 30): Certificate[] { const threshold = Date.now() + days * 86400000; return this.list().filter(c => c.validTo.getTime() < threshold); }
}
export const certManager = new CertManager();
