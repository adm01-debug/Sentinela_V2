// Permission types for Sentinela v17

export interface Permission {
  id: string;
  name: string;
  slug: string;
  description: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
  conditions?: PermissionCondition[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PermissionResource = 
  | 'users'
  | 'teams'
  | 'departments'
  | 'projects'
  | 'employees'
  | 'activities'
  | 'screenshots'
  | 'alerts'
  | 'reports'
  | 'settings'
  | 'integrations'
  | 'api_keys'
  | 'webhooks'
  | 'billing'
  | 'audit_logs'
  | 'roles'
  | 'permissions'
  | '*';

export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'export'
  | 'import'
  | 'approve'
  | '*';

export type PermissionScope = 'own' | 'team' | 'department' | 'organization' | 'all';

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt';
  value: unknown;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCheck {
  resource: PermissionResource;
  action: PermissionAction;
  resourceId?: string;
  context?: Record<string, unknown>;
}

export interface PermissionCheckResult {
  allowed: boolean;
  permission?: Permission;
  reason?: string;
  conditions?: PermissionCondition[];
}

export interface UserPermissions {
  userId: string;
  roleId: string;
  permissions: string[];
  effectivePermissions: Permission[];
  scope: PermissionScope;
}

export interface PermissionFilters {
  resource?: PermissionResource;
  action?: PermissionAction;
  scope?: PermissionScope;
  isSystem?: boolean;
  isActive?: boolean;
  search?: string;
}
