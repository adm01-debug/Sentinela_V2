import { EgressRule, NetworkPolicyPeer, NetworkPolicyPort } from './types';

export class EgressPolicyBuilder {
  private rules: EgressRule[] = [];
  
  allowTo(peer: NetworkPolicyPeer, ports?: NetworkPolicyPort[]): this {
    this.rules.push({ to: [peer], ports });
    return this;
  }
  
  allowToPods(selector: Record<string, string>, ports?: NetworkPolicyPort[]): this {
    return this.allowTo({ podSelector: { matchLabels: selector } }, ports);
  }
  
  allowToNamespace(selector: Record<string, string>, ports?: NetworkPolicyPort[]): this {
    return this.allowTo({ namespaceSelector: { matchLabels: selector } }, ports);
  }
  
  allowToIP(cidr: string, except?: string[], ports?: NetworkPolicyPort[]): this {
    return this.allowTo({ ipBlock: { cidr, except } }, ports);
  }
  
  allowDNS(): this { return this.allowTo({ podSelector: { matchLabels: { 'k8s-app': 'kube-dns' } } }, [{ protocol: 'UDP', port: 53 }]); }
  
  build(): EgressRule[] { return this.rules; }
}