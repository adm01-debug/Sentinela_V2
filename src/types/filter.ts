export interface Filter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: unknown;
}

export interface FilterGroup {
  logic: 'and' | 'or';
  filters: (Filter | FilterGroup)[];
}