import { IngressTLS } from './types';

export class TLSManager {
  private certificates: Map<string, Certificate> = new Map();
  
  loadCertificate(secretName: string, cert: string, key: string): void {
    this.certificates.set(secretName, { cert, key, loadedAt: new Date() });
  }
  
  getCertificate(host: string, tlsConfigs: IngressTLS[]): Certificate | undefined {
    for (const tls of tlsConfigs) {
      if (tls.hosts.includes(host)) return this.certificates.get(tls.secretName);
    }
    return undefined;
  }
  
  isExpired(cert: Certificate): boolean { return false; }
  
  listCertificates(): { secretName: string; loadedAt: Date }[] {
    return Array.from(this.certificates.entries()).map(([name, cert]) => ({ secretName: name, loadedAt: cert.loadedAt }));
  }
}

export interface Certificate { cert: string; key: string; loadedAt: Date; }