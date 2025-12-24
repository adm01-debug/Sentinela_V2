export class DataAggregator {
  aggregate<T>(sources: T[], strategy: AggregationStrategy<T>): T {
    return strategy.aggregate(sources);
  }
}

export interface AggregationStrategy<T> {
  aggregate(sources: T[]): T;
}

export class MergeStrategy<T extends Record<string, unknown>> implements AggregationStrategy<T> {
  aggregate(sources: T[]): T { return Object.assign({}, ...sources); }
}

export class FirstNonNullStrategy<T> implements AggregationStrategy<T> {
  aggregate(sources: T[]): T {
    const result = sources.find(s => s !== null && s !== undefined);
    if (!result) throw new Error('All sources returned null');
    return result;
  }
}

export class ArrayConcatStrategy<T> implements AggregationStrategy<T[]> {
  aggregate(sources: T[][]): T[] { return sources.flat(); }
}