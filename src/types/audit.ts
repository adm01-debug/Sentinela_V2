export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import';

export interface AuditFilter {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  startDate?: string;
  endDate?: string;
  status?: 'success' | 'failure';
}

export interface AuditStats {
  totalActions: number;
  byAction: Record<AuditAction, number>;
  topUsers: { userId: string; count: number }[];
}
