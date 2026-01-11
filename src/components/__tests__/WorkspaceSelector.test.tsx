import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceSelector } from '../WorkspaceSelector';
describe('WorkspaceSelector', () => {
  const workspaces = [{ id: '1', name: 'Main' }, { id: '2', name: 'Dev' }];
  it('renders', () => { render(<WorkspaceSelector workspaces={workspaces} current="1" onChange={vi.fn()} />); expect(screen.getByText('Main')).toBeInTheDocument(); });
  it('changes', () => { const onChange = vi.fn(); render(<WorkspaceSelector workspaces={workspaces} current="1" onChange={onChange} />); fireEvent.click(screen.getByRole('combobox')); fireEvent.click(screen.getByText('Dev')); expect(onChange).toHaveBeenCalledWith('2'); });
});