import { useState, useCallback } from "react";

interface Permission {
  resource: string;
  actions: string[];
}

export function useAccessControl(userPermissions: Permission[] = []) {
  const [permissions] = useState<Permission[]>(userPermissions);

  const can = useCallback(
    (resource: string, action: string) => {
      const permission = permissions.find((p) => p.resource === resource);
      return permission?.actions.includes(action) ?? false;
    },
    [permissions]
  );

  const canAny = useCallback(
    (resource: string, actions: string[]) => {
      return actions.some((action) => can(resource, action));
    },
    [can]
  );

  const canAll = useCallback(
    (resource: string, actions: string[]) => {
      return actions.every((action) => can(resource, action));
    },
    [can]
  );

  return { can, canAny, canAll, permissions };
}
