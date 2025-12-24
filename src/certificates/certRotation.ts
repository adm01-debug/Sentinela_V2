import { Certificate, certManager } from './certManager';
export class CertRotation {
  private rotationDays = 30;
  setRotationThreshold(days: number): void { this.rotationDays = days; }
  needsRotation(cert: Certificate): boolean { const daysLeft = (cert.validTo.getTime() - Date.now()) / 86400000; return daysLeft <= this.rotationDays; }
  getCertsNeedingRotation(): Certificate[] { return certManager.list().filter(c => this.needsRotation(c)); }
  async rotate(certId: string, newCert: Certificate): Promise<void> { certManager.remove(certId); certManager.add(newCert); }
}
export const certRotation = new CertRotation();
