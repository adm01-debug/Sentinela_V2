import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViolationList } from '../ViolationList';
describe('ViolationList', () => {
  const violations = [{ id: '1', type: 'breach', severity: 'high' }, { id: '2', type: 'access', severity: 'low' }];
  it('renders list', () => { render(<ViolationList violations={violations} />); expect(screen.getByText('breach')).toBeInTheDocument(); });
  it('empty state', () => { render(<ViolationList violations={[]} />); expect(screen.getByText(/no violations/i)).toBeInTheDocument(); });
  it('handles select', () => { const onSelect = vi.fn(); render(<ViolationList violations={violations} onSelect={onSelect} />); fireEvent.click(screen.getByText('breach')); expect(onSelect).toHaveBeenCalled(); });
  it('filters by severity', () => { render(<ViolationList violations={violations} filterSeverity="high" />); expect(screen.getByText('breach')).toBeInTheDocument(); expect(screen.queryByText('access')).not.toBeInTheDocument(); });
});