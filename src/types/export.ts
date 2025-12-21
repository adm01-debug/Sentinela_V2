export interface ExportJob {
  id: string;
  type: 'csv' | 'xlsx' | 'pdf' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resource: string;
  filters: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
}

export interface ExportConfig {
  format: ExportJob['type'];
  columns: string[];
  filters?: Record<string, unknown>;
  dateRange?: { start: string; end: string };
  includeHeaders?: boolean;
}

export interface ExportTemplate {
  id: string;
  name: string;
  resource: string;
  config: ExportConfig;
  schedule?: string;
}
