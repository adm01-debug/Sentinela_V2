// Role types for Sentinela v17
import { Permission, PermissionScope } from './permission';

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: RoleType;
  level: number;
  permissions: string[];
  permissionDetails?: Permission[];
  scope: PermissionScope;
  parentRoleId?: string;
  parentRole?: Role;
  childRoles?: Role[];
  userCount: number;
  isSystem: boolean;
  isDefault: boolean;
  isActive: boolean;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
}

export type RoleType = 
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'supervisor'
  | 'analyst'
  | 'viewer'
  | 'custom';

export interface RoleHierarchy {
  role: Role;
  children: RoleHierarchy[];
  level: number;
  path: string[];
}

export interface RoleCreateInput {
  name: string;
  description?: string;
  type?: RoleType;
  level?: number;
  permissions: string[];
  scope?: PermissionScope;
  parentRoleId?: string;
  isDefault?: boolean;
  metadata?: unknown;
}

export interface RoleUpdateInput {
  name?: string;
  description?: string;
  level?: number;
  permissions?: string[];
  scope?: PermissionScope;
  parentRoleId?: string;
  isDefault?: boolean;
  isActive?: boolean;
  metadata?: unknown;
}

export interface RoleFilters {
  type?: RoleType;
  scope?: PermissionScope;
  parentRoleId?: string;
  isSystem?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface RoleStats {
  total: number;
  active: number;
  system: number;
  custom: number;
  byType: Record<RoleType, number>;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string;
}

export interface RoleComparison {
  role1: Role;
  role2: Role;
  commonPermissions: string[];
  uniqueToRole1: string[];
  uniqueToRole2: string[];
}
