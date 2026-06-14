export interface ApiRequest<T = unknown> { method: HttpMethod; url: string; data?: T; params?: Record<string, unknown>; headers?: Record<string, string>; timeout?: number; }
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface PaginatedRequest { page?: number; pageSize?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; }
export interface FilterRequest { search?: string; filters?: Record<string, unknown>; dateRange?: { start: string; end: string }; }
export interface BulkRequest<T> { items: T[]; action: 'create' | 'update' | 'delete'; }
export interface UploadRequest { file: File; type: string; metadata?: Record<string, unknown>; }
