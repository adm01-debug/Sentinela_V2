import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApplicationRuleRow } from '../ApplicationRuleRow';

describe('ApplicationRuleRow', () => {
  // ApplicationRuleRow expects rule with { id, name, category, status }
  const mockRule = {
    id: '1',
    name: 'Chrome',
    category: 'Browser',
    status: 'allowed' as const,
  };

  it('renders rule name', () => {
    render(<ApplicationRuleRow rule={mockRule} onStatusChange={vi.fn()} />);
    expect(screen.getByText('Chrome')).toBeInTheDocument();
  });

  it('shows category', () => {
    render(<ApplicationRuleRow rule={mockRule} onStatusChange={vi.fn()} />);
    expect(screen.getByText('Browser')).toBeInTheDocument();
  });

  it('displays status in select', () => {
    render(<ApplicationRuleRow rule={mockRule} onStatusChange={vi.fn()} />);
    // Status is shown in a combobox/select
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows edit button when onEdit provided', () => {
    render(
      <ApplicationRuleRow
        rule={mockRule}
        onStatusChange={vi.fn()}
        onEdit={vi.fn()}
      />
    );
    expect(screen.getByText('Editar')).toBeInTheDocument();
  });

  it('shows delete button when onDelete provided', () => {
    render(
      <ApplicationRuleRow
        rule={mockRule}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Excluir')).toBeInTheDocument();
  });
});
