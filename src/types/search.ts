export interface SearchQuery {
  q: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  took: number;
}

export interface SearchHighlight {
  field: string;
  snippets: string[];
}