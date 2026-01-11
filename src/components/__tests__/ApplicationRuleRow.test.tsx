import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApplicationRuleRow } from '../ApplicationRuleRow';
describe('ApplicationRuleRow', () => {
  const rule = { id: '1', app: 'Chrome', action: 'allow', schedule: '9-17' };
  it('renders rule', () => { render(<ApplicationRuleRow rule={rule} />); expect(screen.getByText('Chrome')).toBeInTheDocument(); });
  it('shows action', () => { render(<ApplicationRuleRow rule={rule} />); expect(screen.getByText('allow')).toBeInTheDocument(); });
  it('handles edit', () => { const onEdit = vi.fn(); render(<ApplicationRuleRow rule={rule} onEdit={onEdit} />); fireEvent.click(screen.getByRole('button', { name: /edit/i })); expect(onEdit).toHaveBeenCalled(); });
  it('handles delete', () => { const onDelete = vi.fn(); render(<ApplicationRuleRow rule={rule} onDelete={onDelete} />); fireEvent.click(screen.getByRole('button', { name: /delete/i })); expect(onDelete).toHaveBeenCalled(); });
});