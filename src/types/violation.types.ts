/**
 * Violation Types
 * Core type definitions for violation-related entities
 */

export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ViolationStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed' | 'false_positive';
export type ViolationCategory = 
  | 'security'
  | 'productivity'
  | 'policy'
  | 'compliance'
  | 'geofence'
  | 'time'
  | 'data'
  | 'behavior';

export interface Violation {
  id: string;
  employee_id: string;
  rule_id: string;
  severity: ViolationSeverity;
  status: ViolationStatus;
  category: ViolationCategory;
  title: string;
  description: string;
  details?: ViolationDetails;
  detected_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ViolationDetails {
  source?: string;
  evidence?: ViolationEvidence[];
  context?: Record<string, unknown>;
  related_violations?: string[];
  auto_resolved?: boolean;
  escalated?: boolean;
  escalation_level?: number;
}

export interface ViolationEvidence {
  type: 'screenshot' | 'log' | 'activity' | 'location' | 'file';
  url?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  description?: string;
}

export interface ViolationRule {
  id: string;
  name: string;
  description: string;
  category: ViolationCategory;
  severity: ViolationSeverity;
  is_active: boolean;
  conditions: ViolationCondition[];
  actions: ViolationAction[];
  schedule?: RuleSchedule;
  applies_to?: RuleAppliesTo;
  cooldown_minutes?: number;
  max_occurrences_per_day?: number;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ViolationCondition {
  type: ConditionType;
  operator: ConditionOperator;
  value: string | number | boolean | string[];
  field?: string;
  metadata?: Record<string, unknown>;
}

export type ConditionType = 
  | 'application'
  | 'website'
  | 'keyword'
  | 'time'
  | 'duration'
  | 'location'
  | 'productivity'
  | 'pattern'
  | 'file'
  | 'custom';

export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'matches_regex'
  | 'greater_than'
  | 'less_than'
  | 'between'
  | 'in_list'
  | 'not_in_list';

export interface ViolationAction {
  type: ActionType;
  config?: Record<string, unknown>;
  delay_minutes?: number;
}

export type ActionType = 
  | 'notify_manager'
  | 'notify_admin'
  | 'send_email'
  | 'send_slack'
  | 'send_webhook'
  | 'block_access'
  | 'log_only'
  | 'escalate'
  | 'take_screenshot'
  | 'custom';

export interface RuleSchedule {
  enabled: boolean;
  days: number[]; // 0-6, Sunday-Saturday
  start_time: string; // HH:mm
  end_time: string;
  timezone: string;
}

export interface RuleAppliesTo {
  all_employees?: boolean;
  employee_ids?: string[];
  department_ids?: string[];
  team_ids?: string[];
  role_ids?: string[];
  exclude_employee_ids?: string[];
}

export interface ViolationComment {
  id: string;
  violation_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface ViolationHistory {
  id: string;
  violation_id: string;
  user_id: string;
  action: ViolationHistoryAction;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  notes?: string;
  created_at: string;
}

export type ViolationHistoryAction = 
  | 'created'
  | 'status_changed'
  | 'severity_changed'
  | 'assigned'
  | 'escalated'
  | 'comment_added'
  | 'evidence_added'
  | 'resolved'
  | 'reopened';

// Filter and query types
export interface ViolationFilters {
  search?: string;
  status?: ViolationStatus | ViolationStatus[];
  severity?: ViolationSeverity | ViolationSeverity[];
  category?: ViolationCategory | ViolationCategory[];
  employee_id?: string;
  rule_id?: string;
  date_from?: string;
  date_to?: string;
  resolved?: boolean;
}

export interface ViolationSort {
  field: 'detected_at' | 'severity' | 'status' | 'category';
  direction: 'asc' | 'desc';
}

export interface ViolationQueryOptions {
  filters?: ViolationFilters;
  sort?: ViolationSort;
  pagination?: {
    page: number;
    limit: number;
  };
  include?: ('employee' | 'rule' | 'comments' | 'history')[];
}

// Statistics types
export interface ViolationStatistics {
  total: number;
  by_severity: Record<ViolationSeverity, number>;
  by_status: Record<ViolationStatus, number>;
  by_category: Record<ViolationCategory, number>;
  trend: ViolationTrendPoint[];
  avg_resolution_time_hours?: number;
  top_offenders?: { employee_id: string; count: number }[];
  top_rules?: { rule_id: string; count: number }[];
}

export interface ViolationTrendPoint {
  date: string;
  count: number;
  by_severity?: Record<ViolationSeverity, number>;
}

// Response types
export interface ViolationListResponse {
  data: Violation[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ViolationWithRelations extends Violation {
  employee?: {
    id: string;
    full_name: string;
    email: string;
    department: string;
  };
  rule?: ViolationRule;
  comments?: ViolationComment[];
  history?: ViolationHistory[];
}
