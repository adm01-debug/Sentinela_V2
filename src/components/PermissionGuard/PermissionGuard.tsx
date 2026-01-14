import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface PermissionGuardProps {
  permission: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const { user } = useAuth();
  
  const permissions = Array.isArray(permission) ? permission : [permission];
  // Check if user has admin role - admins have all permissions
  const isAdmin = user?.role === "admin" || user?.isAdmin;
  const hasPermission = isAdmin || permissions.length === 0;
  
  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
}
