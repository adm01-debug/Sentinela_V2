export class DataAggregator {
  private aggregations: Map<string, AggregationRule> = new Map();
  
  addRule(name: string, rule: AggregationRule): void { this.aggregations.set(name, rule); }
  
  aggregate(sources: Record<string, unknown>): unknown {
    const result: Record<string, unknown> = {};
    this.aggregations.forEach((rule, name) => {
      result[name] = rule.aggregate(sources);
    });
    return result;
  }
}

export interface AggregationRule {
  aggregate(sources: Record<string, unknown>): unknown;
}

export class MergeRule implements AggregationRule {
  constructor(private sourceKeys: string[]) {}
  aggregate(sources: Record<string, unknown>): unknown {
    return this.sourceKeys.reduce((acc, key) => ({ ...acc, ...(sources[key] as object ?? {}) }), {});
  }
}

export class SelectRule implements AggregationRule {
  constructor(private sourceKey: string, private path: string) {}
  aggregate(sources: Record<string, unknown>): unknown {
    const source = sources[this.sourceKey] as Record<string, unknown>;
    return this.path.split('.').reduce((obj, key) => (obj as Record<string, unknown>)?.[key], source);
  }
}