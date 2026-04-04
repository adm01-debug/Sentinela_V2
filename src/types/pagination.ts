// Pagination types for Sentinela v17

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationInput {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface CursorPagination {
  cursor?: string;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
  meta?: PaginationMeta;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: CursorPagination;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  requestedAt: string;
  executionTime: number;
  cacheHit?: boolean;
  queryHash?: string;
}

export interface PaginationConfig {
  defaultPageSize: number;
  maxPageSize: number;
  pageSizeOptions: number[];
  showPageSizeSelector: boolean;
  showPageNumbers: boolean;
  showFirstLast: boolean;
  showPrevNext: boolean;
  siblingCount: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
}

export interface PageInfo {
  startIndex: number;
  endIndex: number;
  currentPage: number;
  totalPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function calculatePagination(
  page: number,
  pageSize: unknown,
  total
): Pagination {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

export function getPageInfo(pagination: Pagination): PageInfo {
  const { page, pageSize, total, totalPages } = pagination;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, total - 1);
  return {
    startIndex,
    endIndex,
    currentPage: page,
    totalPages,
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
  };
}

export function generatePageNumbers(
  currentPage: unknown,
  totalPages: unknown,
  siblingCount = 1
): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;
  
  if (leftSibling > 1) pages.push(1);
  if (showLeftEllipsis) pages.push('ellipsis');
  
  for (let i = leftSibling; i <= rightSibling; i++) {
    pages.push(i);
  }
  
  if (showRightEllipsis) pages.push('ellipsis');
  if (rightSibling < totalPages) pages.push(totalPages);
  
  return pages;
}
