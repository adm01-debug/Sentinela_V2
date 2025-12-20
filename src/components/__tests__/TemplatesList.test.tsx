import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplatesList } from '../templates/TemplatesList';

const mockTemplates = [
  {
    id: '1',
    name: 'Welcome Template',
    content: 'Hello {{employee_name}}',
    category: 'welcome',
    variables: ['{{employee_name}}'],
    is_active: true,
    created_at: new Date().toISOString(),
    usage_count: 5,
  },
  {
    id: '2',
    name: 'Alert Template',
    content: 'Alert: {{violation_type}}',
    category: 'alert',
    variables: ['{{violation_type}}'],
    is_active: false,
    created_at: new Date().toISOString(),
    usage_count: 10,
  },
];

const mockCategories = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'alert', label: 'Alert' },
];

describe('TemplatesList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleStatus = vi.fn();

  it('renders templates', () => {
    render(
      <TemplatesList
        templates={mockTemplates}
        categories={mockCategories}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getByText('Welcome Template')).toBeInTheDocument();
    expect(screen.getByText('Alert Template')).toBeInTheDocument();
  });

  it('shows empty state when no templates', () => {
    render(
      <TemplatesList
        templates={[]}
        categories={mockCategories}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getByText(/nenhum template/i)).toBeInTheDocument();
  });

  it('shows category badges', () => {
    render(
      <TemplatesList
        templates={mockTemplates}
        categories={mockCategories}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Alert')).toBeInTheDocument();
  });
});
