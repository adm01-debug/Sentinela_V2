import { IngressRule, NetworkPolicyPeer, NetworkPolicyPort } from './types';

export class IngressPolicyBuilder {
  private rules: IngressRule[] = [];
  
  allowFrom(peer: NetworkPolicyPeer, ports?: NetworkPolicyPort[]): this {
    this.rules.push({ from: [peer], ports });
    return this;
  }
  
  allowFromPods(selector: Record<string, string>, ports?: NetworkPolicyPort[]): this {
    return this.allowFrom({ podSelector: { matchLabels: selector } }, ports);
  }
  
  allowFromNamespace(selector: Record<string, string>, ports?: NetworkPolicyPort[]): this {
    return this.allowFrom({ namespaceSelector: { matchLabels: selector } }, ports);
  }
  
  allowFromIP(cidr: string, except?: string[], ports?: NetworkPolicyPort[]): this {
    return this.allowFrom({ ipBlock: { cidr, except } }, ports);
  }
  
  allowFromAnywhere(ports?: NetworkPolicyPort[]): this {
    this.rules.push({ from: [], ports });
    return this;
  }
  
  build(): IngressRule[] { return this.rules; }
}