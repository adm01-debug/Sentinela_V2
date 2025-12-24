import { LabelSelector, LabelSelectorRequirement, Pod } from './types';

export class PodAffinityMatcher {
  matchesSelector(pod: Pod, selector: LabelSelector): boolean {
    if (selector.matchLabels) {
      for (const [key, value] of Object.entries(selector.matchLabels)) {
        if (pod.labels[key] !== value) return false;
      }
    }
    
    if (selector.matchExpressions) {
      for (const expr of selector.matchExpressions) {
        if (!this.matchesExpression(pod.labels, expr)) return false;
      }
    }
    
    return true;
  }
  
  private matchesExpression(labels: Record<string, string>, expr: LabelSelectorRequirement): boolean {
    const value = labels[expr.key];
    
    switch (expr.operator) {
      case 'In': return expr.values?.includes(value) ?? false;
      case 'NotIn': return !expr.values?.includes(value);
      case 'Exists': return expr.key in labels;
      case 'DoesNotExist': return !(expr.key in labels);
    }
  }
  
  findMatchingPods(pods: Pod[], selector: LabelSelector, namespaces?: string[]): Pod[] {
    return pods.filter(pod => {
      if (namespaces && !namespaces.includes(pod.namespace)) return false;
      return this.matchesSelector(pod, selector);
    });
  }
}