/**
 * Report Types
 * Core type definitions for report-related entities
 */

export type ReportType = 
  | 'productivity'
  | 'violations'
  | 'attendance'
  | 'activity'
  | 'security'
  | 'compliance'
  | 'executive'
  | 'custom';

export type ReportFormat = 'pdf' | 'csv' | 'excel' | 'json' | 'html';
export type ReportFrequency = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
export type ReportStatus = 'draft' | 'generating' | 'completed' | 'failed' | 'scheduled';

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  filters: ReportFilters;
  columns?: ReportColumn[];
  grouping?: ReportGrouping;
  sorting?: ReportSorting[];
  file_url?: string;
  file_size?: number;
  generation_time_ms?: number;
  error_message?: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  generated_at?: string;
}

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  employee_ids?: string[];
  department_ids?: string[];
  team_ids?: string[];
  violation_severities?: string[];
  violation_categories?: string[];
  custom_filters?: Record<string, unknown>;
}

export interface ReportColumn {
  id: string;
  name: string;
  field: string;
  type: ColumnType;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: string;
  aggregate?: AggregateFunction;
  visible?: boolean;
}

export type ColumnType = 'string' | 'number' | 'date' | 'datetime' | 'boolean' | 'currency' | 'percentage' | 'duration';
export type AggregateFunction = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'count_distinct';

export interface ReportGrouping {
  fields: string[];
  show_subtotals?: boolean;
  show_grand_total?: boolean;
}

export interface ReportSorting {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  is_system: boolean;
  config: ReportTemplateConfig;
  organization_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplateConfig {
  default_filters?: Partial<ReportFilters>;
  columns: ReportColumn[];
  grouping?: ReportGrouping;
  sorting?: ReportSorting[];
  chart_config?: ReportChartConfig;
}

export interface ReportChartConfig {
  enabled: boolean;
  type: ChartType;
  x_axis?: string;
  y_axis?: string[];
  colors?: string[];
  show_legend?: boolean;
  stacked?: boolean;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'heatmap';

export interface ScheduledReport {
  id: string;
  report_id?: string;
  template_id?: string;
  name: string;
  frequency: ReportFrequency;
  schedule_config: ScheduleConfig;
  format: ReportFormat;
  filters: ReportFilters;
  recipients: ReportRecipient[];
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  last_run_status?: 'success' | 'failed';
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleConfig {
  time: string; // HH:mm
  timezone: string;
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  week_of_month?: number; // 1-4 for biweekly
}

export interface ReportRecipient {
  type: 'user' | 'email' | 'slack' | 'webhook';
  value: string; // user_id, email, channel, or webhook URL
  name?: string;
}

export interface ReportDelivery {
  id: string;
  scheduled_report_id: string;
  status: 'pending' | 'sending' | 'delivered' | 'failed';
  recipient: ReportRecipient;
  file_url?: string;
  error_message?: string;
  delivered_at?: string;
  created_at: string;
}

export interface ReportData {
  headers: ReportColumn[];
  rows: ReportRow[];
  summary?: ReportSummary;
  metadata: ReportMetadata;
}

export interface ReportRow {
  id: string | number;
  data: Record<string, unknown>;
  children?: ReportRow[]; // For grouped data
}

export interface ReportSummary {
  totals: Record<string, number>;
  averages?: Record<string, number>;
  counts?: Record<string, number>;
}

export interface ReportMetadata {
  generated_at: string;
  filters_applied: ReportFilters;
  total_rows: number;
  execution_time_ms: number;
  data_range?: {
    from: string;
    to: string;
  };
}

// Query types
export interface ReportQueryOptions {
  type?: ReportType;
  status?: ReportStatus;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  pagination?: {
    page: number;
    limit: number;
  };
}

// Create and update types
export interface ReportCreateInput {
  name: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  filters: ReportFilters;
  columns?: ReportColumn[];
  grouping?: ReportGrouping;
  sorting?: ReportSorting[];
  organization_id: string;
  created_by: string;
}

export interface ScheduledReportCreateInput {
  name: string;
  template_id?: string;
  frequency: ReportFrequency;
  schedule_config: ScheduleConfig;
  format: ReportFormat;
  filters: ReportFilters;
  recipients: ReportRecipient[];
  organization_id: string;
  created_by: string;
}

// Response types
export interface ReportListResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ReportGenerationResult {
  report_id: string;
  status: ReportStatus;
  file_url?: string;
  error?: string;
  generation_time_ms?: number;
}
