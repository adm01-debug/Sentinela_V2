# Permissions System

Role-based access control in Sentinela.

## Roles

| Role      | Description                    |
| --------- | ------------------------------ |
| `admin`   | Full system access             |
| `manager` | Manage employees, view reports |
| `viewer`  | Read-only access               |

## Permissions

See `src/constants/permissions.ts` for all permissions.

## Using Permissions

### Hook

```tsx
import { usePermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const { hasPermission, isAdmin } = usePermissions();

  if (!hasPermission("employees:edit")) {
    return <AccessDenied />;
  }
}
```

### Component

```tsx
import { PermissionGate } from "@/components/auth/PermissionGate";

<PermissionGate permission="employees:delete">
  <DeleteButton />
</PermissionGate>;
```

### Multiple Permissions

```tsx
<PermissionGate permissions={["reports:view", "reports:export"]} requireAll={false}>
  <ReportActions />
</PermissionGate>
```

## Adding Permissions

1. Add to `src/constants/permissions.ts`
2. Assign to roles in `ROLE_PERMISSIONS`
