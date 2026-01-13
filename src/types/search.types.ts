export interface SearchQuery { query: string; filters?: SearchFilter[]; sort?: SearchSort; pagination?: SearchPagination; highlight?: boolean; }
export interface SearchFilter { field: string; operator: FilterOperator; value: any; }
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith' | 'range';
export interface SearchSort { field: string; order: 'asc' | 'desc'; }
export interface SearchPagination { page: number; pageSize: number; }
export interface SearchResult<T> { items: T[]; total: number; facets?: SearchFacet[]; highlights?: Record<string, string[]>; }
export interface SearchFacet { field: string; values: Array<{ value: string; count: number }>; }
export interface SearchSuggestion { text: string; type: 'recent' | 'popular' | 'suggestion'; score?: number; }
