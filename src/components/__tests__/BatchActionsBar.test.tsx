import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BatchActionsBar } from '../BatchActionsBar';
describe('BatchActionsBar', () => {
  const actions = [{ id: 'delete', label: 'Delete', icon: 'trash' }, { id: 'export', label: 'Export', icon: 'download' }];
  it('renders when visible', () => { render(<BatchActionsBar visible selectedCount={5} actions={actions} onAction={vi.fn()} />); expect(screen.getByText('5 selected')).toBeInTheDocument(); });
  it('hidden when not visible', () => { const { container } = render(<BatchActionsBar visible={false} selectedCount={0} actions={actions} onAction={vi.fn()} />); expect(container.firstChild).toHaveClass('hidden'); });
  it('executes action', () => { const onAction = vi.fn(); render(<BatchActionsBar visible selectedCount={3} actions={actions} onAction={onAction} />); fireEvent.click(screen.getByText('Delete')); expect(onAction).toHaveBeenCalledWith('delete'); });
});