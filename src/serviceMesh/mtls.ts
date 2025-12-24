// Mutual TLS for Service Mesh
export interface Certificate {
  id: string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  publicKey: string;
}

export interface MTLSConfig {
  mode: "strict" | "permissive" | "disabled";
  rootCA: string;
  certificates: Map<string, Certificate>;
}

export class MTLSManager {
  private config: MTLSConfig;
  private serviceCerts: Map<string, Certificate> = new Map();

  constructor(config: Partial<MTLSConfig> = {}) {
    this.config = { mode: "permissive", rootCA: "", certificates: new Map(), ...config };
  }

  setMode(mode: MTLSConfig["mode"]): void {
    this.config.mode = mode;
  }

  issueCertificate(serviceName: string): Certificate {
    const cert: Certificate = {
      id: crypto.randomUUID(),
      subject: serviceName,
      issuer: "mesh-ca",
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      publicKey: \`pub-key-\${serviceName}\`
    };
    this.serviceCerts.set(serviceName, cert);
    return cert;
  }

  validateCertificate(serviceName: string, cert: Certificate): boolean {
    if (this.config.mode === "disabled") return true;
    const stored = this.serviceCerts.get(serviceName);
    if (!stored) return this.config.mode === "permissive";
    return stored.id === cert.id && new Date() < stored.validTo;
  }

  revokeCertificate(serviceName: string): void {
    this.serviceCerts.delete(serviceName);
  }

  rotateCertificates(): void {
    for (const serviceName of this.serviceCerts.keys()) {
      this.issueCertificate(serviceName);
    }
  }
}
