/**
 * @fileoverview Ingress Manager
 * @module @sentinela/core/ingressController
 */
export interface IngressRule { path: string; service: string; port?: number; }
export class IngressManager {
  private rules = new Map<string, IngressRule[]>();
  async updateRules(name: string, rules: IngressRule[]): Promise<void> { this.rules.set(name, rules); }
  async getRules(name: string): Promise<IngressRule[]> { return this.rules.get(name) ?? []; }
  async deleteRules(name: string): Promise<void> { this.rules.delete(name); }
  async route(path: string): Promise<string | undefined> {
    for (const rules of this.rules.values()) {
      const rule = rules.find(r => path.startsWith(r.path));
      if (rule) return rule.service;
    }
    return undefined;
  }
}
