// Audit Log types for Sentinela v17

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: AuditAction;
  category: AuditCategory;
  resource: AuditResource;
  resourceId?: string;
  resourceName?: string;
  description: string;
  changes?: AuditChanges;
  metadata: AuditMetadata;
  ipAddress?: string;
  userAgent?: string;
  geoLocation?: GeoLocation;
  status: "success" | "failure" | "pending";
  errorMessage?: string;
  duration?: number;
  timestamp: string;
  expiresAt?: string;
}

export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "export"
  | "import"
  | "enable"
  | "disable"
  | "approve"
  | "reject"
  | "invite"
  | "revoke"
  | "download"
  | "upload"
  | "archive"
  | "restore";

export type AuditCategory =
  | "authentication"
  | "authorization"
  | "user_management"
  | "team_management"
  | "settings"
  | "data_access"
  | "report"
  | "alert"
  | "integration"
  | "billing"
  | "system"
  | "security";

export type AuditResource =
  | "user"
  | "team"
  | "department"
  | "project"
  | "employee"
  | "activity"
  | "screenshot"
  | "alert"
  | "report"
  | "setting"
  | "integration"
  | "api_key"
  | "webhook"
  | "role"
  | "permission"
  | "session"
  | "export"
  | "import";

export interface AuditChanges {
  before?: unknown;
  after?: unknown;
  fields?: string[];
}

export interface AuditMetadata {
  sessionId?: string;
  requestId?: string;
  apiKeyId?: string;
  source: "web" | "api" | "mobile" | "desktop" | "system" | "scheduled";
  version?: string;
  correlationId?: string;
  tags?: string[];
}

export interface GeoLocation {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  category?: AuditCategory;
  resource?: AuditResource;
  resourceId?: string;
  status?: "success" | "failure";
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditLogStats {
  total: number;
  byAction: Record<AuditAction, number>;
  byCategory: Record<AuditCategory, number>;
  byStatus: { success: number; failure: number };
  byUser: { userId: string; count: number }[];
  recentActivity: AuditLog[];
}

export interface AuditLogExport {
  format: "csv" | "json" | "xlsx";
  filters?: AuditLogFilters;
  fields?: string[];
  dateRange: { start: string; end: string };
}

export interface AuditRetentionPolicy {
  id: string;
  name: string;
  retentionDays: number;
  categories?: AuditCategory[];
  actions?: AuditAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
