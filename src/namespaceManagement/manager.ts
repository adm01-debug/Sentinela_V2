/**
 * @fileoverview Namespace manager
 * @module @sentinela/core/namespaceManagement
 * @version 13.0.0
 */

import { Namespace, NamespaceConfig } from './types';

export class NamespaceManager {
  private namespaces: Map<string, Namespace> = new Map();
  private configs: Map<string, NamespaceConfig> = new Map();
  
  create(name: string, labels?: Record<string, string>): Namespace {
    const ns: Namespace = { name, labels, status: 'Active' };
    this.namespaces.set(name, ns);
    return ns;
  }
  
  delete(name: string): boolean {
    const ns = this.namespaces.get(name);
    if (!ns) return false;
    ns.status = 'Terminating';
    setTimeout(() => this.namespaces.delete(name), 100);
    return true;
  }
  
  get(name: string): Namespace | undefined { return this.namespaces.get(name); }
  list(): Namespace[] { return Array.from(this.namespaces.values()); }
  
  setConfig(name: string, config: NamespaceConfig): void { this.configs.set(name, config); }
  getConfig(name: string): NamespaceConfig | undefined { return this.configs.get(name); }
  
  addLabel(name: string, key: string, value: string): void {
    const ns = this.namespaces.get(name);
    if (ns) { if (!ns.labels) ns.labels = {}; ns.labels[key] = value; }
  }
}