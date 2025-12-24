import { NodeSelectorRequirement, NodeSelectorTerm, Node } from './types';

export class AffinityMatcher {
  matchesTerm(node: Node, term: NodeSelectorTerm): boolean {
    if (term.matchExpressions) {
      for (const expr of term.matchExpressions) {
        if (!this.matchesExpression(node.labels, expr)) return false;
      }
    }
    return true;
  }
  
  private matchesExpression(labels: Record<string, string>, expr: NodeSelectorRequirement): boolean {
    const value = labels[expr.key];
    
    switch (expr.operator) {
      case 'In': return expr.values?.includes(value) ?? false;
      case 'NotIn': return !expr.values?.includes(value);
      case 'Exists': return expr.key in labels;
      case 'DoesNotExist': return !(expr.key in labels);
      case 'Gt': return value !== undefined && parseFloat(value) > parseFloat(expr.values?.[0] ?? '0');
      case 'Lt': return value !== undefined && parseFloat(value) < parseFloat(expr.values?.[0] ?? '0');
    }
  }
  
  scoreNode(node: Node, preferred: { weight: number; preference: NodeSelectorTerm }[]): number {
    let score = 0;
    for (const pref of preferred) {
      if (this.matchesTerm(node, pref.preference)) score += pref.weight;
    }
    return score;
  }
}