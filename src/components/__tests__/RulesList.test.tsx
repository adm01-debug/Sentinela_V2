import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RulesList } from '../rules/RulesList';

const mockRules = [
  {
    id: '1',
    name: 'Block Social Media',
    description: 'Blocks access to social media sites',
    type: 'url',
    severity: 'high',
    is_active: true,
    triggered_count: 150,
  },
  {
    id: '2',
    name: 'Idle Alert',
    description: 'Alert when idle for too long',
    type: 'idle',
    severity: 'low',
    is_active: false,
    triggered_count: 25,
  },
];

const mockRuleTypes = [
  { value: 'url', label: 'URL' },
  { value: 'idle', label: 'Idle' },
];

describe('RulesList', () => {
  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggle: vi.fn(),
  };

  it('renders rules', () => {
    render(
      <RulesList
        rules={mockRules}
        ruleTypes={mockRuleTypes}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Block Social Media')).toBeInTheDocument();
    expect(screen.getByText('Idle Alert')).toBeInTheDocument();
  });

  it('shows empty state when no rules', () => {
    render(
      <RulesList
        rules={[]}
        ruleTypes={mockRuleTypes}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/nenhuma regra/i)).toBeInTheDocument();
  });

  it('shows triggered count', () => {
    render(
      <RulesList
        rules={mockRules}
        ruleTypes={mockRuleTypes}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });
});
