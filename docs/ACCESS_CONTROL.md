# Access Control

## Overview
Role-based access control (RBAC) implementation.

## Roles
- Admin
- Manager
- User
- Viewer

## Permissions
| Permission | Admin | Manager | User | Viewer |
|------------|-------|---------|------|--------|
| Read | ✓ | ✓ | ✓ | ✓ |
| Write | ✓ | ✓ | ✓ | - |
| Delete | ✓ | ✓ | - | - |
| Admin | ✓ | - | - | - |