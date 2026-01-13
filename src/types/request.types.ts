export interface ApiRequest<T = any> { method: HttpMethod; url: string; data?: T; params?: Record<string, any>; headers?: Record<string, string>; timeout?: number; }
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface PaginatedRequest { page?: number; pageSize?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; }
export interface FilterRequest { search?: string; filters?: Record<string, any>; dateRange?: { start: string; end: string }; }
export interface BulkRequest<T> { items: T[]; action: 'create' | 'update' | 'delete'; }
export interface UploadRequest { file: File; type: string; metadata?: Record<string, any>; }
