import { DaemonSet } from './types';

export class NodeSelectorEvaluator {
  evaluate(ds: DaemonSet, nodeLabels: Record<string, string>): boolean {
    const selector = ds.template.spec.nodeSelector;
    if (!selector) return true;
    return Object.entries(selector).every(([key, value]) => nodeLabels[key] === value);
  }
  
  findMatchingNodes(ds: DaemonSet, nodes: { name: string; labels: Record<string, string> }[]): string[] {
    return nodes.filter(n => this.evaluate(ds, n.labels)).map(n => n.name);
  }
}