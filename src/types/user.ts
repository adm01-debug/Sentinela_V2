// User types for Sentinela v17
import { Role } from "./role";
import { Team } from "./team";
import { Department } from "./department";

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  role: Role;
  roleId: string;
  teamId?: string;
  team?: Team;
  departmentId?: string;
  department?: Department;
  status: UserStatus;
  isActive: boolean;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginAt?: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  preferences: UserPreferences;
  permissions: string[];
}

export type UserStatus = "active" | "inactive" | "pending" | "suspended" | "deleted";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  slack: boolean;
  alerts: boolean;
  reports: boolean;
  weeklyDigest: boolean;
}

export interface DashboardPreferences {
  defaultView: string;
  widgets: string[];
  refreshInterval: number;
}

export interface UserCreateInput {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string;
  teamId?: string;
  departmentId?: string;
}

export interface UserUpdateInput {
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  roleId?: string;
  teamId?: string;
  departmentId?: string;
  status?: UserStatus;
  preferences?: Partial<UserPreferences>;
}

export interface UserFilters {
  search?: string;
  status?: UserStatus;
  roleId?: string;
  teamId?: string;
  departmentId?: string;
  isActive?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  newThisMonth: number;
}
