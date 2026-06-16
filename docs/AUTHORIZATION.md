# Authorization Guide

## Overview

Role-based access control (RBAC) and permission management.

## Permission Model

### Hierarchy

```
Organization
  └── Teams
        └── Users
              └── Roles
                    └── Permissions
```

### Roles

| Role        | Description             | Scope        |
| ----------- | ----------------------- | ------------ |
| Super Admin | Full system access      | Global       |
| Org Admin   | Organization management | Organization |
| Team Lead   | Team management         | Team         |
| Manager     | View and manage reports | Team         |
| User        | Basic access            | Self         |
| Viewer      | Read-only access        | Team         |

### Permissions

```typescript
const permissions = {
  // User management
  "users:read": "View users",
  "users:write": "Create/edit users",
  "users:delete": "Delete users",

  // Team management
  "teams:read": "View teams",
  "teams:write": "Create/edit teams",
  "teams:delete": "Delete teams",

  // Reports
  "reports:read": "View reports",
  "reports:write": "Create reports",
  "reports:export": "Export reports",

  // Settings
  "settings:read": "View settings",
  "settings:write": "Modify settings",

  // Monitoring
  "monitoring:read": "View activity",
  "monitoring:write": "Manage monitoring",
};
```

## Implementation

### Permission Check Middleware

```typescript
function requirePermission(...permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    // Check each required permission
    for (const permission of permissions) {
      if (!hasPermission(user, permission)) {
        throw new ForbiddenError(`Missing permission: ${permission}`);
      }
    }

    next();
  };
}

// Usage
router.get("/users", requirePermission("users:read"), getUsers);
router.post("/users", requirePermission("users:write"), createUser);
```

### Frontend Permission Guard

```typescript
const PermissionGuard: FC<{ permission: string; children: ReactNode }> = ({
  permission,
  children,
}) => {
  const { user } = useAuth();

  if (!hasPermission(user, permission)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};

// Usage
<PermissionGuard permission="reports:export">
  <ExportButton />
</PermissionGuard>
```

### Resource-Level Authorization

```typescript
async function canAccessResource(user: User, resource: Resource, action: string) {
  // Check ownership
  if (resource.ownerId === user.id) return true;

  // Check team membership
  if (resource.teamId && user.teams.includes(resource.teamId)) {
    return hasTeamPermission(user, resource.teamId, action);
  }

  // Check organization role
  if (resource.orgId === user.orgId) {
    return hasOrgPermission(user, action);
  }

  return false;
}
```

## Role Definitions

### Default Role Permissions

```typescript
const rolePermissions = {
  super_admin: ["*"], // All permissions

  org_admin: ["users:*", "teams:*", "reports:*", "settings:*", "monitoring:*"],

  team_lead: ["users:read", "teams:read", "teams:write", "reports:*", "monitoring:read"],

  manager: ["users:read", "teams:read", "reports:read", "reports:write", "monitoring:read"],

  user: ["reports:read", "monitoring:read"],

  viewer: ["reports:read"],
};
```

## Audit Trail

### Permission Changes

```typescript
async function updateUserRole(userId: string, newRole: string, updatedBy: string) {
  const oldRole = await getUserRole(userId);

  await db.userRoles.update({ where: { userId }, data: { role: newRole } });

  await auditLog.create({
    action: "role_changed",
    targetUserId: userId,
    performedBy: updatedBy,
    details: { oldRole, newRole },
  });
}
```

## Related Documentation

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [PERMISSIONS.md](./PERMISSIONS.md)
- [AUDIT_TRAIL.md](./AUDIT_TRAIL.md)
