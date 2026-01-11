import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActions } from '../QuickActions';
describe('QuickActions', () => {
  const actions = [{ id: '1', label: 'Add Employee', icon: 'plus' }, { id: '2', label: 'Export Report', icon: 'download' }];
  it('renders actions', () => { render(<QuickActions actions={actions} onAction={vi.fn()} />); expect(screen.getByText('Add Employee')).toBeInTheDocument(); });
  it('handles action click', () => { const onAction = vi.fn(); render(<QuickActions actions={actions} onAction={onAction} />); fireEvent.click(screen.getByText('Add Employee')); expect(onAction).toHaveBeenCalledWith('1'); });
  it('shows icons', () => { render(<QuickActions actions={actions} onAction={vi.fn()} />); expect(screen.getByTestId('icon-plus')).toBeInTheDocument(); });
});