import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionGate } from '../PermissionGate';

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: (p: string) => p === 'allowed',
    hasAnyPermission: (perms: string[]) => perms.includes('allowed'),
    hasAllPermissions: (perms: string[]) => perms.every(p => p === 'allowed'),
  }),
}));

describe('PermissionGate', () => {
  it('should render children when has permission', () => {
    render(<PermissionGate permission="allowed"><div>Content</div></PermissionGate>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should not render children without permission', () => {
    render(<PermissionGate permission="denied"><div>Content</div></PermissionGate>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should render fallback without permission', () => {
    render(<PermissionGate permission="denied" fallback={<div>No access</div>}><div>Content</div></PermissionGate>);
    expect(screen.getByText('No access')).toBeInTheDocument();
  });
});
