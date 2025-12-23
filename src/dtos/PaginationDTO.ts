export interface PaginationDTO { page: number; limit: number; total: number; pages: number; }
export interface PaginatedResponseDTO<T> { data: T[]; pagination: PaginationDTO; }
export interface PaginationParamsDTO { page?: number; limit?: number; orderBy?: string; order?: 'asc' | 'desc'; }
