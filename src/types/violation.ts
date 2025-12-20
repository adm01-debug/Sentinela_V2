export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ViolationStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export type ViolationType =
  | 'unauthorized_access'
  | 'data_leak'
  | 'policy_breach'
  | 'suspicious_activity'
  | 'geofence_breach'
  | 'time_violation'
  | 'app_violation'
  | 'url_violation'
  | 'keyword_detected'
  | 'excessive_idle'
  | 'unauthorized_software'
  | 'usb_violation'
  | 'print_violation'
  | 'other';

export interface Violation {
  id: string;
  employee_id: string;
  violation_type: ViolationType;
  severity: ViolationSeverity;
  status: ViolationStatus;
  description?: string;
  evidence?: ViolationEvidence;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface ViolationEvidence {
  screenshot_id?: string;
  url?: string;
  app_name?: string;
  keyword?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  metadata?: Record<string, unknown>;
}

export interface ViolationWithEmployee extends Violation {
  employee: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
}

export interface ViolationFilters {
  severity?: ViolationSeverity;
  status?: ViolationStatus;
  type?: ViolationType;
  employee_id?: string;
  date_from?: string;
  date_to?: string;
}
