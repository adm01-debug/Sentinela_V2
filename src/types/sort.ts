export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface MultiSort {
  sorts: SortConfig[];
}