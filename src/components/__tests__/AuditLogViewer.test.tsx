import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditLogViewer } from '../AuditLogViewer';
describe('AuditLogViewer', () => {
  const logs = [{ id: '1', action: 'create', resource: 'employee', user: 'admin', timestamp: '2026-01-01T10:00:00Z' }];
  it('renders', () => { render(<AuditLogViewer logs={logs} />); expect(screen.getByText('create')).toBeInTheDocument(); });
  it('filters', () => { const onFilter = vi.fn(); render(<AuditLogViewer logs={logs} onFilter={onFilter} />); fireEvent.change(screen.getByPlaceholderText(/filter/i), { target: { value: 'create' } }); expect(onFilter).toHaveBeenCalled(); });
  it('exports', () => { const onExport = vi.fn(); render(<AuditLogViewer logs={logs} onExport={onExport} />); fireEvent.click(screen.getByText(/export/i)); expect(onExport).toHaveBeenCalled(); });
});