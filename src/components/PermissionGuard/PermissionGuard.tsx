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
  const hasPermission = permissions.some(p => user?.permissions?.includes(p) || user?.role === "admin");
  
  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
}
