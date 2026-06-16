export type Permission = "read" | "write" | "delete" | "admin" | "*";

export type Resource =
  | "employees"
  | "activities"
  | "reports"
  | "alerts"
  | "settings"
  | "users"
  | "geofences"
  | "dlp"
  | "ueba"
  | "audit_logs"
  | "devices"
  | "integrations"
  | "billing";

export type Role = "admin" | "manager" | "analyst" | "viewer" | "security_officer" | "hr";

const rolePermissions: Record<Role, Partial<Record<Resource, Permission[]>>> = {
  admin: {
    employees: ["*"],
    activities: ["*"],
    reports: ["*"],
    alerts: ["*"],
    settings: ["*"],
    users: ["*"],
    geofences: ["*"],
    dlp: ["*"],
    ueba: ["*"],
    audit_logs: ["*"],
    devices: ["*"],
    integrations: ["*"],
    billing: ["*"],
  },
  security_officer: {
    activities: ["read"],
    alerts: ["*"],
    dlp: ["*"],
    ueba: ["*"],
    audit_logs: ["read"],
    devices: ["read"],
  },
  manager: {
    employees: ["read", "write"],
    activities: ["read"],
    reports: ["read", "write"],
    alerts: ["read", "write"],
    settings: ["read"],
    users: ["read"],
    geofences: ["read", "write"],
    devices: ["read"],
  },
  hr: {
    employees: ["*"],
    activities: ["read"],
    reports: ["read"],
    billing: ["read"],
  },
  analyst: {
    employees: ["read"],
    activities: ["read"],
    reports: ["read", "write"],
    alerts: ["read"],
    settings: ["read"],
    users: ["read"],
    devices: ["read"],
  },
  viewer: {
    employees: ["read"],
    activities: ["read"],
    reports: ["read"],
    alerts: ["read"],
    settings: [],
    users: [],
  },
};

export const hasPermission = (role: Role, resource: Resource, permission: Permission): boolean => {
  const perms = rolePermissions[role]?.[resource] || [];
  return perms.includes("*") || perms.includes(permission);
};

export const getPermissions = (role: Role): Partial<Record<Resource, Permission[]>> =>
  rolePermissions[role] || {};
