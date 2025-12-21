# User Permissions

## Roles

| Role | Description |
|------|-------------|
| Admin | Full access |
| Manager | Team management |
| Viewer | Read-only access |
| Employee | Self-service only |

## Permissions Matrix

| Action | Admin | Manager | Viewer | Employee |
|--------|-------|---------|--------|----------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ |
| Manage Employees | ✓ | ✓ | ✗ | ✗ |
| View Violations | ✓ | ✓ | ✓ | Own |
| Configure Policies | ✓ | ✗ | ✗ | ✗ |
| Generate Reports | ✓ | ✓ | ✓ | ✗ |
| System Settings | ✓ | ✗ | ✗ | ✗ |

## Implementation

### Check Permission
```typescript
const { hasPermission } = usePermissions();

if (!hasPermission('manage_employees')) {
  return <AccessDenied />;
}
```

### Permission Gate
```tsx
<PermissionGate permission="manage_employees">
  <EmployeeForm />
</PermissionGate>
```

## Row-Level Security

```sql
CREATE POLICY "Users see own data"
  ON employees
  FOR SELECT
  USING (auth.uid() = user_id);
```
