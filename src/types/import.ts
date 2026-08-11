// Import types for Sentinela v17

export interface Import {
  id: string;
  name: string;
  resourceType: ImportResourceType;
  format: ImportFormat;
  status: ImportStatus;
  sourceFile: ImportFile;
  mapping: FieldMapping[];
  options: ImportOptions;
  validation: ImportValidation;
  results?: ImportResults;
  progress: number;
  error?: string;
  requestedBy: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export type ImportResourceType = 
  | 'employees'
  | 'users'
  | 'teams'
  | 'departments'
  | 'projects'
  | 'applications'
  | 'categories';

export type ImportFormat = 'csv' | 'xlsx' | 'json' | 'xml';

export type ImportStatus = 
  | 'pending'
  | 'validating'
  | 'validated'
  | 'processing'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'cancelled';

export interface ImportFile {
  name: string;
  url: string;
  size: number;
  mimeType: string;
  rowCount?: number;
  columns?: string[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: FieldTransform;
  defaultValue?: unknown;
  required: boolean;
}

export interface FieldTransform {
  type: 'lowercase' | 'uppercase' | 'trim' | 'date' | 'number' | 'boolean' | 'custom';
  format?: string;
  customFunction?: string;
}

export interface ImportOptions {
  skipHeader: boolean;
  delimiter?: string;
  encoding: string;
  dateFormat: string;
  timezone: string;
  onDuplicate: 'skip' | 'update' | 'error';
  batchSize: number;
  validateOnly: boolean;
  sendNotifications: boolean;
}

export interface ImportValidation {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  field: string;
  value: unknown;
  message: string;
  code: string;
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
}

export interface ImportResults {
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  failedRows: number[];
  duration: number;
}

export interface ImportCreateInput {
  resourceType: ImportResourceType;
  fileId: string;
  mapping: FieldMapping[];
  options?: Partial<ImportOptions>;
}

export interface ImportFilters {
  resourceType?: ImportResourceType;
  status?: ImportStatus;
  requestedBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface ImportStats {
  total: number;
  completed: number;
  failed: number;
  totalRecordsImported: number;
  byResource: Record<ImportResourceType, number>;
}

export interface ImportTemplate {
  id: string;
  name: string;
  resourceType: ImportResourceType;
  format: ImportFormat;
  mapping: FieldMapping[];
  options: ImportOptions;
  sampleFileUrl?: string;
  createdAt: string;
}
