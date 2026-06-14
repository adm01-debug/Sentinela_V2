export interface ApiResponse<T = unknown> { data: T; success: boolean; message?: string; meta?: ResponseMeta; }
export interface ResponseMeta { requestId: string; timestamp: string; duration: number; }
export interface PaginatedResponse<T> { data: T[]; pagination: PaginationMeta; }
export interface PaginationMeta { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean; }
export interface BulkResponse { succeeded: number; failed: number; errors?: Array<{ index: number; error: string }>; }
export interface UploadResponse { id: string; url: string; filename: string; size: number; mimeType: string; }
