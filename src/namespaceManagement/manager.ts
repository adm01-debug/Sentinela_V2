/**
 * @fileoverview Namespace Manager
 * @module @sentinela/core/namespaceManagement
 */
export interface Namespace { name: string; labels?: Record<string, string>; }
export class NamespaceManager {
  private namespaces = new Map<string, Namespace>();
  async create(ns: Namespace): Promise<void> { this.namespaces.set(ns.name, ns); }
  async get(name: string): Promise<Namespace | undefined> { return this.namespaces.get(name); }
  async delete(name: string): Promise<void> { this.namespaces.delete(name); }
  async list(): Promise<Namespace[]> { return Array.from(this.namespaces.values()); }
}
