import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from '../CommandPalette';
describe('CommandPalette', () => {
  const commands = [{ id: '1', label: 'Go to Dashboard', action: vi.fn() }, { id: '2', label: 'Search Users', action: vi.fn() }];
  it('renders when open', () => { render(<CommandPalette open commands={commands} onClose={vi.fn()} />); expect(screen.getByRole('dialog')).toBeInTheDocument(); });
  it('filters commands by search', () => { render(<CommandPalette open commands={commands} onClose={vi.fn()} />); fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Dashboard' } }); expect(screen.getByText('Go to Dashboard')).toBeInTheDocument(); expect(screen.queryByText('Search Users')).not.toBeInTheDocument(); });
  it('executes command on click', () => { render(<CommandPalette open commands={commands} onClose={vi.fn()} />); fireEvent.click(screen.getByText('Go to Dashboard')); expect(commands[0].action).toHaveBeenCalled(); });
  it('closes on escape', () => { const onClose = vi.fn(); render(<CommandPalette open commands={commands} onClose={onClose} />); fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' }); expect(onClose).toHaveBeenCalled(); });
});