/**
 * @fileoverview Service Accounts Manager
 * @module @sentinela/core/serviceAccounts
 */
export interface ServiceAccount { name: string; namespace: string; secrets?: string[]; }
export class ServiceAccountManager {
  private accounts = new Map<string, ServiceAccount>();
  async create(sa: ServiceAccount): Promise<void> { this.accounts.set(sa.namespace + '/' + sa.name, sa); }
  async get(namespace: string, name: string): Promise<ServiceAccount | undefined> { return this.accounts.get(namespace + '/' + name); }
  async delete(namespace: string, name: string): Promise<void> { this.accounts.delete(namespace + '/' + name); }
  async addSecret(namespace: string, name: string, secret: string): Promise<void> {
    const sa = await this.get(namespace, name);
    if (sa) { sa.secrets = sa.secrets ?? []; sa.secrets.push(secret); }
  }
}
