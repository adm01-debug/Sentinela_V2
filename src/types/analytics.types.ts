/**
 * Analytics Types
 * Core type definitions for analytics and metrics
 */

export type TimeGranularity = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
export type MetricType = 'count' | 'sum' | 'average' | 'min' | 'max' | 'percentile' | 'rate';
export type TrendDirection = 'up' | 'down' | 'stable';

// Dashboard Types
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  config: WidgetConfig;
  position: WidgetPosition;
  refresh_interval_seconds?: number;
}

export type WidgetType =
  | 'metric_card'
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'area_chart'
  | 'heatmap'
  | 'table'
  | 'list'
  | 'map'
  | 'gauge'
  | 'sparkline'
  | 'custom';

export interface WidgetConfig {
  metric?: string;
  dimensions?: string[];
  filters?: unknown;
  time_range?: TimeRange;
  comparison?: ComparisonConfig;
  visualization?: VisualizationConfig;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TimeRange {
  type: 'relative' | 'absolute';
  value?: string; // e.g., 'last_7_days', 'this_month'
  start?: string;
  end?: string;
  timezone?: string;
}

export interface ComparisonConfig {
  enabled: boolean;
  type: 'previous_period' | 'same_period_last_year' | 'custom';
  custom_range?: TimeRange;
}

export interface VisualizationConfig {
  colors?: string[];
  show_legend?: boolean;
  show_labels?: boolean;
  stacked?: boolean;
  line_style?: 'solid' | 'dashed' | 'dotted';
  fill_area?: boolean;
  smooth_curve?: boolean;
}

// Metric Types
export interface Metric {
  id: string;
  name: string;
  description?: string;
  type: MetricType;
  unit?: string;
  format?: MetricFormat;
  calculation?: MetricCalculation;
}

export interface MetricFormat {
  type: 'number' | 'currency' | 'percentage' | 'duration' | 'bytes';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
}

export interface MetricCalculation {
  formula: string;
  variables: Record<string, string>;
}

export interface MetricValue {
  value: number;
  formatted_value: string;
  timestamp?: string;
  dimensions?: Record<string, string>;
}

export interface MetricWithTrend extends MetricValue {
  previous_value?: number;
  change: number;
  change_percent: number;
  trend: TrendDirection;
}

// Time Series Types
export interface TimeSeriesData {
  metric: string;
  granularity: TimeGranularity;
  data_points: TimeSeriesDataPoint[];
  summary?: TimeSeriesSummary;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  dimensions?: Record<string, string>;
  metadata?: unknown;
}

export interface TimeSeriesSummary {
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
  first_value: number;
  last_value: number;
}

// Aggregation Types
export interface AggregationQuery {
  metrics: string[];
  dimensions?: string[];
  filters?: AggregationFilter[];
  time_range: TimeRange;
  granularity?: TimeGranularity;
  limit?: number;
  order_by?: AggregationOrderBy;
}

export interface AggregationFilter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export type FilterOperator = 
  | 'eq' | 'neq' 
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'not_in'
  | 'like' | 'not_like'
  | 'between'
  | 'is_null' | 'is_not_null';

export interface AggregationOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface AggregationResult {
  query: AggregationQuery;
  data: AggregationRow[];
  metadata: AggregationMetadata;
}

export interface AggregationRow {
  dimensions: Record<string, string>;
  metrics: Record<string, number>;
}

export interface AggregationMetadata {
  execution_time_ms: number;
  rows_scanned: number;
  cache_hit: boolean;
}

// Funnel Analysis
export interface FunnelDefinition {
  id: string;
  name: string;
  steps: FunnelStep[];
  conversion_window_days?: number;
}

export interface FunnelStep {
  id: string;
  name: string;
  event: string;
  filters?: AggregationFilter[];
}

export interface FunnelResult {
  funnel_id: string;
  time_range: TimeRange;
  steps: FunnelStepResult[];
  overall_conversion_rate: number;
}

export interface FunnelStepResult {
  step_id: string;
  name: string;
  count: number;
  conversion_rate: number;
  drop_off_rate: number;
  avg_time_to_next_step_seconds?: number;
}

// Cohort Analysis
export interface CohortDefinition {
  id: string;
  name: string;
  cohort_event: string;
  return_event: string;
  cohort_period: TimeGranularity;
  return_periods: number;
}

export interface CohortResult {
  cohort_id: string;
  time_range: TimeRange;
  cohorts: CohortRow[];
}

export interface CohortRow {
  cohort_date: string;
  cohort_size: number;
  retention_rates: number[]; // Array of retention rates for each period
}

// Segmentation
export interface Segment {
  id: string;
  name: string;
  description?: string;
  filters: AggregationFilter[];
  is_dynamic: boolean;
  member_count?: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// Real-time Analytics
export interface RealtimeMetric {
  metric: string;
  value: number;
  previous_value?: number;
  change_percent?: number;
  updated_at: string;
}

export interface RealtimeEvent {
  event_type: string;
  user_id?: string;
  properties: unknown;
  timestamp: string;
}

// Analytics Query Builder
export interface AnalyticsQuery {
  select: SelectClause[];
  from: string;
  where?: WhereClause[];
  group_by?: string[];
  order_by?: OrderByClause[];
  limit?: number;
  offset?: number;
}

export interface SelectClause {
  field: string;
  alias?: string;
  aggregate?: MetricType;
}

export interface WhereClause {
  field: string;
  operator: FilterOperator;
  value: unknown;
  conjunction?: 'AND' | 'OR';
}

export interface OrderByClause {
  field: string;
  direction: 'asc' | 'desc';
}

// Export Types
export interface AnalyticsExport {
  id: string;
  query: AnalyticsQuery | AggregationQuery;
  format: 'csv' | 'json' | 'parquet';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}
