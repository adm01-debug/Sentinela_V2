import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionGate } from '../PermissionGate';
import { PERMISSIONS } from '@/constants/permissions';

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: (p: string) => p === PERMISSIONS.EMPLOYEES_VIEW,
    hasAnyPermission: (perms: string[]) => perms.includes(PERMISSIONS.EMPLOYEES_VIEW),
    hasAllPermissions: (perms: string[]) => perms.every(p => p === PERMISSIONS.EMPLOYEES_VIEW),
  }),
}));

describe('PermissionGate', () => {
  it('should render children when has permission', () => {
    render(<PermissionGate permission={PERMISSIONS.EMPLOYEES_VIEW}><div>Content</div></PermissionGate>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should not render children without permission', () => {
    render(<PermissionGate permission={PERMISSIONS.ADMIN_ACCESS}><div>Content</div></PermissionGate>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should render fallback without permission', () => {
    render(<PermissionGate permission={PERMISSIONS.ADMIN_ACCESS} fallback={<div>No access</div>}><div>Content</div></PermissionGate>);
    expect(screen.getByText('No access')).toBeInTheDocument();
  });
});
