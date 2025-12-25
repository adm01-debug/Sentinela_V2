/**
 * @fileoverview Service account manager
 * @module @sentinela/core/serviceAccounts
 * @version 13.0.0
 */

import { ServiceAccount, SecretRef } from './types';

export class ServiceAccountManager {
  private accounts: Map<string, ServiceAccount> = new Map();
  
  create(sa: ServiceAccount): ServiceAccount {
    const account = { ...sa, secrets: sa.secrets ?? [], automountServiceAccountToken: sa.automountServiceAccountToken ?? true };
    this.accounts.set(this.key(sa), account);
    return account;
  }
  
  delete(namespace: string, name: string): boolean { return this.accounts.delete(namespace + '/' + name); }
  get(namespace: string, name: string): ServiceAccount | undefined { return this.accounts.get(namespace + '/' + name); }
  
  list(namespace?: string): ServiceAccount[] {
    const all = Array.from(this.accounts.values());
    return namespace ? all.filter(sa => sa.namespace === namespace) : all;
  }
  
  addSecret(namespace: string, name: string, secretName: string): void {
    const sa = this.get(namespace, name);
    if (sa) sa.secrets?.push({ name: secretName });
  }
  
  addImagePullSecret(namespace: string, name: string, secretName: string): void {
    const sa = this.get(namespace, name);
    if (sa) {
      if (!sa.imagePullSecrets) sa.imagePullSecrets = [];
      sa.imagePullSecrets.push({ name: secretName });
    }
  }
  
  private key(sa: ServiceAccount): string { return sa.namespace + '/' + sa.name; }
}