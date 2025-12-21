export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  actions: PermissionAction[];
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

export interface UserPermissions {
  userId: string;
  roles: string[];
  directPermissions: string[];
  effectivePermissions: string[];
}

export interface PermissionCheck {
  resource: string;
  action: PermissionAction;
  allowed: boolean;
  reason?: string;
}
