export class ServiceAccountSecretManager {
  private secrets: Map<string, SASecret> = new Map();
  
  createSecret(namespace: string, serviceAccountName: string): SASecret {
    const secret: SASecret = {
      name: serviceAccountName + '-token-' + Math.random().toString(36).slice(2, 7),
      namespace,
      type: 'kubernetes.io/service-account-token',
      data: { token: this.generateToken(), 'ca.crt': this.generateCACert(), namespace: Buffer.from(namespace).toString('base64') },
      annotations: { 'kubernetes.io/service-account.name': serviceAccountName }
    };
    this.secrets.set(namespace + '/' + secret.name, secret);
    return secret;
  }
  
  getSecretsForServiceAccount(namespace: string, serviceAccountName: string): SASecret[] {
    return Array.from(this.secrets.values()).filter(s => s.namespace === namespace && s.annotations['kubernetes.io/service-account.name'] === serviceAccountName);
  }
  
  private generateToken(): string { return Buffer.from(Math.random().toString(36).repeat(10)).toString('base64'); }
  private generateCACert(): string { return Buffer.from('-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----').toString('base64'); }
}

export interface SASecret { name: string; namespace: string; type: string; data: Record<string, string>; annotations: Record<string, string>; }