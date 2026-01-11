// Sort types for Sentinela v17

export interface Sort {
  field: string;
  direction: SortDirection;
  nullsPosition?: NullsPosition;
  priority?: number;
}

export type SortDirection = 'asc' | 'desc';

export type NullsPosition = 'first' | 'last';

export interface SortConfig {
  field: string;
  label: string;
  type: SortType;
  defaultDirection?: SortDirection;
  isSortable: boolean;
  customSort?: string;
}

export type SortType = 'string' | 'number' | 'date' | 'boolean' | 'custom';

export interface MultiSort {
  sorts: Sort[];
  maxSorts?: number;
}

export interface SortPreset {
  id: string;
  name: string;
  sorts: Sort[];
  isDefault?: boolean;
}

export interface SortState {
  current: Sort[];
  available: SortConfig[];
  presets: SortPreset[];
}

export interface AppliedSort {
  field: string;
  direction: SortDirection;
  label: string;
  index: number;
}

export interface SortableColumn {
  field: string;
  label: string;
  sortable: boolean;
  currentDirection?: SortDirection;
  sortPriority?: number;
}

export interface SortOptions {
  allowMultiSort: boolean;
  maxSortFields: number;
  persistSort: boolean;
  defaultSort?: Sort;
  nullsFirst: boolean;
}

export function createSort(field: string, direction: SortDirection = 'asc'): Sort {
  return { field, direction };
}

export function toggleDirection(direction: SortDirection): SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}

export function sortToQueryString(sorts: Sort[]): string {
  return sorts
    .map(s => `${s.direction === 'desc' ? '-' : ''}${s.field}`)
    .join(',');
}

export function parseQueryStringToSort(queryString: string): Sort[] {
  if (!queryString) return [];
  return queryString.split(',').map(part => ({
    field: part.startsWith('-') ? part.slice(1) : part,
    direction: part.startsWith('-') ? 'desc' : 'asc',
  }));
}
