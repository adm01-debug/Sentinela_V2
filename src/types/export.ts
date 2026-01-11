// Export types for Sentinela v17

export interface Export {
  id: string;
  name: string;
  type: ExportType;
  resourceType: ExportResourceType;
  format: ExportFormat;
  status: ExportStatus;
  filters?: Record<string, unknown>;
  fields?: string[];
  options: ExportOptions;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  recordCount?: number;
  progress: number;
  error?: string;
  requestedBy: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export type ExportType = 'manual' | 'scheduled' | 'automated';

export type ExportResourceType = 
  | 'employees'
  | 'activities'
  | 'screenshots'
  | 'alerts'
  | 'reports'
  | 'users'
  | 'teams'
  | 'audit_logs'
  | 'analytics';

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf' | 'xml';

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired';

export interface ExportOptions {
  includeHeaders: boolean;
  dateFormat: string;
  timezone: string;
  delimiter?: string;
  encoding?: string;
  compression?: 'none' | 'zip' | 'gzip';
  splitSize?: number;
  includeMetadata: boolean;
  anonymize?: boolean;
  password?: string;
}

export interface ExportCreateInput {
  name?: string;
  resourceType: ExportResourceType;
  format: ExportFormat;
  filters?: Record<string, unknown>;
  fields?: string[];
  options?: Partial<ExportOptions>;
}

export interface ExportSchedule {
  id: string;
  name: string;
  exportConfig: ExportCreateInput;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportFilters {
  type?: ExportType;
  resourceType?: ExportResourceType;
  format?: ExportFormat;
  status?: ExportStatus;
  requestedBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExportStats {
  total: number;
  completed: number;
  failed: number;
  byFormat: Record<ExportFormat, number>;
  byResource: Record<ExportResourceType, number>;
  totalSize: number;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  config: ExportCreateInput;
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}
