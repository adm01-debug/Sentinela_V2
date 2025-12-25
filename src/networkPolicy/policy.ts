/**
 * @fileoverview Network policy manager
 * @module @sentinela/core/networkPolicy
 * @version 13.0.0
 */

import { NetworkPolicy, IngressRule, EgressRule, Selector } from './types';

export class NetworkPolicyBuilder {
  private policy: Partial<NetworkPolicy> = { ingress: [], egress: [] };
  
  name(name: string): this { this.policy.name = name; return this; }
  namespace(ns: string): this { this.policy.namespace = ns; return this; }
  podSelector(selector: Selector): this { this.policy.podSelector = selector; return this; }
  
  allowIngress(rule: IngressRule): this { this.policy.ingress!.push(rule); return this; }
  allowEgress(rule: EgressRule): this { this.policy.egress!.push(rule); return this; }
  
  denyAllIngress(): this { this.policy.ingress = []; return this; }
  denyAllEgress(): this { this.policy.egress = []; return this; }
  
  build(): NetworkPolicy { return this.policy as NetworkPolicy; }
}

export class PolicyTemplates {
  static denyAll(name: string, namespace: string): NetworkPolicy {
    return { name, namespace, podSelector: { matchLabels: {} }, ingress: [], egress: [] };
  }
  
  static allowFromNamespace(name: string, namespace: string, fromNs: string): NetworkPolicy {
    return {
      name, namespace, podSelector: { matchLabels: {} },
      ingress: [{ from: [{ namespaceSelector: { matchLabels: { name: fromNs } } }], ports: [] }],
      egress: []
    };
  }
}