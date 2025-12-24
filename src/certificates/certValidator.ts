import { Certificate } from './certManager';
export class CertValidator {
  isValid(cert: Certificate): boolean { const now = new Date(); return now >= cert.validFrom && now <= cert.validTo; }
  isExpired(cert: Certificate): boolean { return new Date() > cert.validTo; }
  isNotYetValid(cert: Certificate): boolean { return new Date() < cert.validFrom; }
  daysUntilExpiry(cert: Certificate): number { return Math.floor((cert.validTo.getTime() - Date.now()) / 86400000); }
  validateChain(certs: Certificate[]): boolean { return certs.every(c => this.isValid(c)); }
}
export const certValidator = new CertValidator();
